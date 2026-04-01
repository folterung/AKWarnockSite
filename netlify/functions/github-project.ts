import { Handler } from '@netlify/functions';

const GITHUB_TOKEN = process.env.GITHUB_PROJECT_TOKEN;
const PROJECT_NUMBER = 5;
const PROJECT_OWNER = 'folterung';

// In-memory cache
let cache: { data: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface GitHubProjectField {
  name: string;
  options?: { id: string; name: string }[];
}

interface GitHubProjectItem {
  content: {
    title?: string;
    body?: string;
    number?: number;
    url?: string;
    labels?: { nodes: { name: string; color: string }[] };
    assignees?: { nodes: { login: string; avatarUrl: string; url: string }[] };
  } | null;
  fieldValues: {
    nodes: {
      field?: { name: string };
      name?: string;       // SingleSelectField value
      text?: string;       // TextField value
      number?: number;     // NumberField value
      date?: string;       // DateField value
    }[];
  };
}

const GRAPHQL_QUERY = `
query($owner: String!, $number: Int!, $cursor: String) {
  user(login: $owner) {
    projectV2(number: $number) {
      title
      shortDescription
      updatedAt
      fields(first: 30) {
        nodes {
          ... on ProjectV2SingleSelectField {
            name
            options {
              id
              name
            }
          }
          ... on ProjectV2Field {
            name
          }
        }
      }
      items(first: 100, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          content {
            ... on Issue {
              title
              body
              number
              url
              labels(first: 10) {
                nodes {
                  name
                  color
                }
              }
              assignees(first: 5) {
                nodes {
                  login
                  avatarUrl
                  url
                }
              }
            }
            ... on DraftIssue {
              title
              body
            }
          }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                field { ... on ProjectV2SingleSelectField { name } }
                name
              }
              ... on ProjectV2ItemFieldTextValue {
                field { ... on ProjectV2Field { name } }
                text
              }
              ... on ProjectV2ItemFieldNumberValue {
                field { ... on ProjectV2Field { name } }
                number
              }
              ... on ProjectV2ItemFieldDateValue {
                field { ... on ProjectV2Field { name } }
                date
              }
            }
          }
        }
      }
    }
  }
}
`;

async function fetchAllItems() {
  const allItems: GitHubProjectItem[] = [];
  let cursor: string | null = null;
  let projectMeta = null;
  let fields: GitHubProjectField[] = [];

  do {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { owner: PROJECT_OWNER, number: PROJECT_NUMBER, cursor },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    const project = json.data.user.projectV2;
    if (!projectMeta) {
      projectMeta = {
        title: project.title,
        description: project.shortDescription,
        updatedAt: project.updatedAt,
      };
      fields = project.fields.nodes;
    }

    allItems.push(...project.items.nodes);
    cursor = project.items.pageInfo.hasNextPage
      ? project.items.pageInfo.endCursor
      : null;
  } while (cursor);

  return { projectMeta, fields, items: allItems };
}

function transformData(raw: {
  projectMeta: { title: string; description: string; updatedAt: string } | null;
  fields: GitHubProjectField[];
  items: GitHubProjectItem[];
}) {
  // Find the Status field and its options (these become columns)
  const statusField = raw.fields.find(
    (f) => f.options && f.name.toLowerCase() === 'status'
  );
  const columns = statusField?.options?.map((o) => o.name) || [];

  // Transform items into a flat list with their field values
  const items = raw.items
    .filter((item) => item.content)
    .map((item) => {
      const fieldMap: Record<string, string | number | null> = {};

      for (const fv of item.fieldValues.nodes) {
        const fieldName = fv.field?.name;
        if (!fieldName) continue;
        if (fv.name !== undefined) fieldMap[fieldName] = fv.name;
        else if (fv.text !== undefined) fieldMap[fieldName] = fv.text;
        else if (fv.number !== undefined) fieldMap[fieldName] = fv.number;
        else if (fv.date !== undefined) fieldMap[fieldName] = fv.date;
      }

      return {
        title: item.content!.title || 'Untitled',
        body: item.content!.body || '',
        number: item.content!.number || null,
        url: item.content!.url || null,
        labels: item.content!.labels?.nodes || [],
        assignees: (item.content!.assignees?.nodes || []).map(a => ({
          login: a.login,
          avatarUrl: a.avatarUrl,
          profileUrl: a.url,
        })),
        fields: fieldMap,
        status: (fieldMap['Status'] as string) || null,
      };
    });

  return {
    meta: {
      title: raw.projectMeta?.title || 'Project Board',
      description: raw.projectMeta?.description || '',
      lastUpdated: raw.projectMeta?.updatedAt || new Date().toISOString(),
    },
    columns,
    items,
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!GITHUB_TOKEN) {
    console.error('GITHUB_PROJECT_TOKEN environment variable is not set');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
      body: cache.data,
    };
  }

  try {
    const raw = await fetchAllItems();
    const data = transformData(raw);
    const body = JSON.stringify(data);

    // Update cache
    cache = { data: body, timestamp: Date.now() };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
      body,
    };
  } catch (err) {
    console.error('Failed to fetch GitHub project:', err);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch project data' }),
    };
  }
};
