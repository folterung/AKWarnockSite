/**
 * Regression test for the dev-only Netlify Functions rewrite.
 *
 * Why: when running `npm run dev:netlify`, Netlify dev proxies the site on
 * :8888 and starts Next.js on :3000. Visiting :3000 directly used to break
 * the ScratchyTD roadmap board because `trailingSlash: true` redirected
 * `/.netlify/functions/github-project` to a path Next has no route for,
 * yielding a 404 in the browser console.
 *
 * The fix is a dev-mode rewrite that forwards `/.netlify/functions/*` to
 * the Netlify dev port. This test locks that behavior.
 */

describe('next.config.mjs rewrites', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV

  afterEach(() => {
    ;(process.env as any).NODE_ENV = ORIGINAL_NODE_ENV
    jest.resetModules()
  })

  async function loadRewrites() {
    jest.resetModules()
    const config = (await import('../../next.config.mjs')).default as {
      rewrites: () => Promise<Array<{ source: string; destination: string }>>
    }
    return config.rewrites()
  }

  it('proxies /.netlify/functions/* to the Netlify dev port in development', async () => {
    ;(process.env as any).NODE_ENV = 'development'
    const rewrites = await loadRewrites()
    const rule = rewrites.find((r) => r.source.startsWith('/.netlify/functions'))
    expect(rule).toBeDefined()
    expect(rule!.source).toBe('/.netlify/functions/:path*')
    expect(rule!.destination).toBe('http://localhost:8888/.netlify/functions/:path*')
  })

  it('returns an empty rewrites array in production', async () => {
    ;(process.env as any).NODE_ENV = 'production'
    const rewrites = await loadRewrites()
    expect(rewrites).toEqual([])
  })
})
