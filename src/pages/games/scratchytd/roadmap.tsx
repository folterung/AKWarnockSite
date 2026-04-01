import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { GetStaticProps } from 'next';
import { roadmapData as defaultRoadmapData } from '@/data/scratchytd-roadmap';

function useRevealOnScroll() {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((el: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    observerRef.current = observer;
  }, [visible]);

  return { ref, visible };
}

// --- Static roadmap types (meta, updates, community, milestones) ---

interface Milestone {
  name: string;
  date: string;
  description?: string;
}

interface Update {
  icon: string;
  title: string;
  description: string;
  date: string;
}

interface CommunityIdea {
  title: string;
  description: string;
  votes?: number;
  author?: string;
}

interface StaticRoadmapData {
  meta: { title: string; description: string; lastUpdated: string };
  milestones: Milestone[];
  recentUpdates: Update[];
  communityIdeas: CommunityIdea[];
}

// --- GitHub project board types ---

interface BoardLabel {
  name: string;
  color: string;
}

interface BoardAssignee {
  login: string;
  avatarUrl: string;
  profileUrl: string;
}

interface BoardItem {
  title: string;
  body: string;
  number: number | null;
  url: string | null;
  labels: BoardLabel[];
  assignees: BoardAssignee[];
  fields: Record<string, string | number | null>;
  status: string | null;
}

interface BoardData {
  meta: { title: string; description: string; lastUpdated: string };
  columns: string[];
  items: BoardItem[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface ScratchyTDRoadmapProps {
  roadmapData: StaticRoadmapData;
}

export default function ScratchyTDRoadmap({ roadmapData }: ScratchyTDRoadmapProps) {
  const staticData = roadmapData;
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [boardError, setBoardError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);

    // Fetch live board data from GitHub via Netlify Function
    fetch('/.netlify/functions/github-project')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(setBoardData)
      .catch(() => setBoardError(true));
  }, []);

  const toggleCard = useCallback((id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Derive labels from board items for filtering
  const allLabels = useMemo(() => {
    if (!boardData) return [];
    const labelSet = new Set<string>();
    boardData.items.forEach(item => {
      item.labels.forEach(l => labelSet.add(l.name));
    });
    return Array.from(labelSet).sort();
  }, [boardData]);

  const filteredItems = useMemo(() => {
    if (!boardData) return [];
    const q = search.toLowerCase().trim();
    return boardData.items.filter(item => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (labelFilter && !item.labels.some(l => l.name === labelFilter)) return false;
      if (q) {
        const haystack = `${item.title} ${item.body} ${item.labels.map(l => l.name).join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [boardData, search, statusFilter, labelFilter]);

  const statusCounts = useMemo(() => {
    if (!boardData) return {};
    const counts: Record<string, number> = {};
    boardData.columns.forEach(c => (counts[c] = 0));
    boardData.items.forEach(item => {
      if (item.status && counts[item.status] !== undefined) counts[item.status]++;
    });
    return counts;
  }, [boardData]);

  const totalItems = boardData?.items.length || 0;
  const dataReady = true;

  const boardReveal = useRevealOnScroll();
  const updatesReveal = useRevealOnScroll();
  const communityReveal = useRevealOnScroll();

  const scrollToFilters = () => {
    const el = document.getElementById('srm-filters');
    if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>Roadmap | ScratchyTD | A.K. Warnock</title>
        <meta name="description" content="Follow the ScratchyTD development roadmap — see what's in progress, what's planned, and what's shipping next." />
      </Head>

      <div className={`srm-page ${mounted ? 'srm-mounted' : ''}`}>
        {/* Floating paws */}
        <div className="srm-paw srm-paw-1" aria-hidden="true">🐾</div>
        <div className="srm-paw srm-paw-2" aria-hidden="true">🐾</div>
        <div className="srm-paw srm-paw-3" aria-hidden="true">🐾</div>

        {/* Nav */}
        <nav className="srm-nav">
          <Link href="/games/scratchytd" className="srm-back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            ScratchyTD
          </Link>
        </nav>

        {/* Header */}
        <header className="srm-header srm-anim-fade" style={{ animationDelay: '0.1s' }}>
          <div className="srm-header-icons">
            <span className="srm-wiggle">🐱</span>
            <span className="srm-wiggle srm-wiggle-delay">🐶</span>
          </div>
          <h1 className="srm-title">ScratchyTD</h1>
          <p className="srm-subtitle">Public Roadmap</p>
          <p className="srm-desc">{staticData.meta.description}</p>
          <p className="srm-updated">Last updated: {formatDate(staticData.meta.lastUpdated)}</p>
        </header>

        {dataReady && (
          <>
            {/* Status pills — from live board columns (only show if static sections exist to scroll past) */}
            {boardData && (staticData.recentUpdates.length > 0 || staticData.milestones.length > 0 || staticData.communityIdeas.length > 0) && (
              <section className="srm-status-summary srm-anim-fade" style={{ animationDelay: '0.25s' }}>
                <button
                  className="srm-status-pill srm-status-pill-clickable"
                  onClick={() => { setStatusFilter(null); scrollToFilters(); }}
                >
                  <span className="srm-pill-count srm-pill-all">{totalItems}</span>
                  All
                </button>
                {boardData.columns.map(col => (
                  <button
                    key={col}
                    className="srm-status-pill srm-status-pill-clickable"
                    onClick={() => { setStatusFilter(col); scrollToFilters(); }}
                  >
                    <span className={`srm-pill-count srm-pill-dynamic`} style={{ background: getColumnColor(col, boardData.columns) }}>
                      {statusCounts[col] || 0}
                    </span>
                    {col}
                  </button>
                ))}
              </section>
            )}

            {/* Latest Updates — from static data */}
            {staticData.recentUpdates.length > 0 && (
              <section className="srm-updates srm-anim-fade" style={{ animationDelay: '0.4s' }}>
                <h2 className="srm-section-title">🐾 Latest Updates</h2>
                <div className="srm-updates-list">
                  {staticData.recentUpdates.map((u, i) => (
                    <div key={i} className="srm-update-card">
                      <span className="srm-update-icon">{u.icon || '📢'}</span>
                      <div className="srm-update-content">
                        <div className="srm-update-title">{u.title}</div>
                        <div className="srm-update-desc">{u.description}</div>
                        <div className="srm-update-date">{formatDate(u.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Community Ideas — from static data */}
            {staticData.communityIdeas.length > 0 && (
              <section className="srm-community srm-anim-fade" style={{ animationDelay: '0.55s' }}>
                <h2 className="srm-section-title">🐾 Ideas from the Community</h2>
                <p className="srm-community-subtitle">Suggestions from our amazing Discord fam! 💬</p>
                <div className="srm-community-list">
                  {staticData.communityIdeas.map((idea, i) => (
                    <div key={i} className="srm-community-card">
                      <div className="srm-community-title">{idea.title}</div>
                      <div className="srm-community-desc">{idea.description}</div>
                      {idea.votes !== undefined && (
                        <span className="srm-community-votes">❤️ {idea.votes} votes</span>
                      )}
                      {idea.author && <div className="srm-community-author">Suggested by {idea.author}</div>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Milestones — from static data */}
            {staticData.milestones.length > 0 && (
              <section ref={updatesReveal.ref} className={`srm-milestones ${updatesReveal.visible ? 'srm-reveal-visible' : 'srm-reveal-hidden'}`}>
                <h2 className="srm-section-title">🐾 Upcoming Milestones</h2>
                <div className="srm-milestones-list">
                  {staticData.milestones
                    .filter(m => new Date(m.date) >= new Date(new Date().toDateString()))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map((m, i) => (
                      <div key={i} className="srm-milestone-card srm-stagger" style={{ transitionDelay: `${i * 0.1}s` }}>
                        <div className="srm-milestone-date">{formatDate(m.date)}</div>
                        <div className="srm-milestone-name">{m.name}</div>
                        {m.description && <div className="srm-milestone-desc">{m.description}</div>}
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Controls / Filters — for the board */}
            {boardData && (
              <section id="srm-filters" ref={communityReveal.ref} className={`srm-controls ${communityReveal.visible ? 'srm-reveal-visible' : 'srm-reveal-hidden'}`}>
                <div className="srm-search-box">
                  <span className="srm-search-icon" aria-hidden="true">🔍</span>
                  <input
                    type="text"
                    placeholder="Search board..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="srm-search-input"
                    aria-label="Search board"
                  />
                </div>
                <div className="srm-filter-group">
                  <label className="srm-filter-label">Status</label>
                  <div className="srm-filter-pills">
                    <button
                      className={`srm-filter-pill ${!statusFilter ? 'srm-pill-active' : ''}`}
                      onClick={() => setStatusFilter(null)}
                    >All</button>
                    {boardData.columns.map(col => (
                      <button
                        key={col}
                        className={`srm-filter-pill ${statusFilter === col ? 'srm-pill-active' : ''}`}
                        onClick={() => setStatusFilter(col)}
                      >{col}</button>
                    ))}
                  </div>
                </div>
                {allLabels.length > 0 && (
                  <div className="srm-filter-group">
                    <label className="srm-filter-label">Label</label>
                    <div className="srm-filter-pills">
                      <button
                        className={`srm-filter-pill ${!labelFilter ? 'srm-pill-active' : ''}`}
                        onClick={() => setLabelFilter(null)}
                      >All</button>
                      {allLabels.map(l => (
                        <button
                          key={l}
                          className={`srm-filter-pill ${labelFilter === l ? 'srm-pill-active' : ''}`}
                          onClick={() => setLabelFilter(l)}
                        >{l}</button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Board — live from GitHub */}
            {boardData && (
              <section ref={boardReveal.ref} className={`srm-board ${boardReveal.visible ? 'srm-reveal-visible' : 'srm-reveal-hidden'}`}>
                {filteredItems.length === 0 ? (
                  <div className="srm-column srm-column-full">
                    <div className="srm-no-results-inline">
                      <span className="srm-no-results-icon">😿</span>
                      <p>No items match your filters. Try adjusting your search!</p>
                    </div>
                  </div>
                ) : !statusFilter ? (
                  boardData.columns.map((col, colIdx) => {
                    const colItems = filteredItems.filter(i => i.status === col);
                    return (
                      <div key={col} className="srm-column srm-stagger" style={{ transitionDelay: `${colIdx * 0.1}s` }}>
                        <div className="srm-column-header">
                          <span className="srm-column-icon">{getColumnIcon(col)}</span>
                          <span className="srm-column-title">{col}</span>
                          <span className="srm-column-count">{colItems.length}</span>
                        </div>
                        <div className="srm-column-cards">
                          {colItems.length ? colItems.map(item => (
                            <BoardCard key={cardKey(item)} item={item} expanded={expandedCards.has(cardKey(item))} onToggle={toggleCard} columns={boardData.columns} />
                          )) : (
                            <div className="srm-column-empty">Nothing here yet — stay tuned!</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="srm-column srm-column-full">
                    <div className="srm-column-cards">
                      {filteredItems.map(item => (
                        <BoardCard key={cardKey(item)} item={item} expanded={expandedCards.has(cardKey(item))} onToggle={toggleCard} columns={boardData.columns} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {boardError && (
              <div className="srm-no-results">
                <span className="srm-no-results-icon">😿</span>
                <p>Could not load project board data. Please try again later.</p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="srm-footer">
          <p>Made with 🐾 by the ScratchyTD team</p>
        </footer>
      </div>
    </>
  );
}

// --- Helper functions ---

function cardKey(item: BoardItem): string {
  return item.number ? `issue-${item.number}` : `draft-${item.title}`;
}

// Assign colors to columns dynamically based on position
const COLUMN_COLORS = ['#7EB8D8', '#F4845F', '#B39DDB', '#7BC67E', '#F7D26B', '#F2A4B8', '#8B6F5E'];
function getColumnColor(col: string, columns: string[]): string {
  const idx = columns.indexOf(col);
  return COLUMN_COLORS[idx % COLUMN_COLORS.length];
}

// Assign icons to columns by common keywords, with fallback
function getColumnIcon(col: string): string {
  const lower = col.toLowerCase();
  if (lower.includes('done') || lower.includes('complete') || lower.includes('shipped')) return '\u2705';
  if (lower.includes('progress') || lower.includes('doing') || lower.includes('active')) return '\u{1F528}';
  if (lower.includes('test') || lower.includes('review') || lower.includes('qa')) return '\u{1F9EA}';
  if (lower.includes('backlog') || lower.includes('plan') || lower.includes('todo') || lower.includes('to do')) return '\u{1F4CB}';
  if (lower.includes('block') || lower.includes('stuck')) return '\u{1F6A7}';
  return '\u{1F4CC}'; // fallback pin
}

// --- Label color helpers ---

function getLabelStyle(color: string): { background: string; color: string } {
  // Handle missing, white, or very light colors with a fallback
  const hex = color.replace('#', '');
  if (!hex || hex === 'ffffff' || hex === 'FFFFFF' || hex === 'ededed' || hex === 'e4e669') {
    return { background: '#F5EDE3', color: '#8B6F5E' };
  }
  // Compute luminance to decide text color
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // For bright colors, darken the text; for dark colors, use white text
  if (luminance > 0.6) {
    return { background: `#${hex}30`, color: darkenHex(hex, 0.5) };
  }
  return { background: `#${hex}20`, color: `#${hex}` };
}

function darkenHex(hex: string, amount: number): string {
  const r = Math.round(parseInt(hex.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(hex.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(hex.slice(4, 6), 16) * (1 - amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// --- Board Card Component ---

const TRUNCATE_THRESHOLD = 120;

function BoardCard({ item, expanded, onToggle, columns }: { item: BoardItem; expanded: boolean; onToggle: (id: string) => void; columns: string[] }) {
  const key = cardKey(item);
  const statusColor = item.status ? getColumnColor(item.status, columns) : '#8B6F5E';
  const isTruncated = item.body.length > TRUNCATE_THRESHOLD;
  const isExpandable = isTruncated;

  // Extract notable fields (skip Status since it's shown by column)
  const extraFields = Object.entries(item.fields).filter(
    ([k]) => k.toLowerCase() !== 'status' && k.toLowerCase() !== 'title'
  );

  // Truncate body for description
  const desc = isTruncated ? item.body.slice(0, TRUNCATE_THRESHOLD) + '...' : item.body;

  return (
    <div
      className={`srm-card ${expanded ? 'srm-card-expanded' : ''} ${!isExpandable ? 'srm-card-static' : ''}`}
      onClick={isExpandable ? () => onToggle(key) : undefined}
    >
      <div className="srm-card-top">
        <span className="srm-card-title">{item.title}</span>
      </div>
      {desc && <div className="srm-card-desc">{desc}</div>}
      {item.labels.length > 0 && (
        <div className="srm-card-tags">
          {item.labels.map(l => {
            const style = getLabelStyle(l.color);
            return (
              <span key={l.name} className="srm-card-tag" style={style}>
                {l.name}
              </span>
            );
          })}
        </div>
      )}
      {item.assignees.length > 0 && (
        <div className="srm-card-assignees">
          {item.assignees.map(a => (
            <a
              key={a.login}
              href={a.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="srm-card-assignee"
              title={a.login}
              onClick={e => e.stopPropagation()}
            >
              <img src={a.avatarUrl} alt={a.login} className="srm-card-avatar" width={22} height={22} />
              <span className="srm-card-assignee-name">{a.login}</span>
            </a>
          ))}
        </div>
      )}
      {item.status && (
        <div className="srm-card-status-indicator" style={{ background: statusColor }} />
      )}
      {isExpandable && <span className="srm-card-hint">tap to expand</span>}
      {isExpandable && (
        <div className="srm-card-details">
          <div className="srm-card-notes">
            <div className="srm-card-notes-label">Description</div>
            {item.body}
          </div>
          {extraFields.length > 0 && (
            <div className="srm-card-fields">
              {extraFields.map(([k, v]) => (
                v != null && (
                  <div key={k} className="srm-card-field">
                    <span className="srm-card-field-label">{k}:</span>{' '}
                    <span className="srm-card-field-value">{String(v)}</span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps<ScratchyTDRoadmapProps> = async () => {
  return {
    props: { roadmapData: defaultRoadmapData },
  };
};
