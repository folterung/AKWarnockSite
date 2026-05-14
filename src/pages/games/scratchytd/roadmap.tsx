import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { GetStaticProps } from 'next';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { roadmapData as defaultRoadmapData } from '@/data/scratchytd-roadmap';

// Force external-link safety on every anchor produced by marked + sanitized
// in the modal body. Registered once at module load.
if (typeof window !== 'undefined' && !(DOMPurify as any).__srmAnchorHook) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if ((node as Element).tagName === 'A') {
      (node as Element).setAttribute('target', '_blank');
      (node as Element).setAttribute('rel', 'noopener noreferrer');
    }
  });
  (DOMPurify as any).__srmAnchorHook = true;
}

function renderMarkdownBody(md: string): string {
  const html = marked.parse(md, { breaks: true, gfm: true, async: false }) as string;
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

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

interface SpriteOption {
  src: string;
  offsetY?: number;
}

const CAT_SPRITES: SpriteOption[] = [
  { src: '/images/games/scratchytd/sprites/cats/basic.png' },
  { src: '/images/games/scratchytd/sprites/cats/heavy.png' },
  { src: '/images/games/scratchytd/sprites/cats/rapid.png' },
];

const DOG_SPRITES: SpriteOption[] = [
  { src: '/images/games/scratchytd/sprites/dogs/basic.png' },
  { src: '/images/games/scratchytd/sprites/dogs/heavy.png', offsetY: -8 },
  { src: '/images/games/scratchytd/sprites/dogs/rapid.png' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ScratchyTDRoadmap({ roadmapData }: ScratchyTDRoadmapProps) {
  const staticData = roadmapData;
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [boardError, setBoardError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BoardItem | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [catSprite] = useState(() => pickRandom(CAT_SPRITES));
  const [dogSprite] = useState(() => pickRandom(DOG_SPRITES));

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

  const openItem = useCallback((item: BoardItem, el: HTMLElement | null) => {
    triggerRef.current = el;
    setSelectedItem(item);
  }, []);

  const closeItem = useCallback(() => {
    setSelectedItem(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger) trigger.focus();
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
            <div className="srm-sprite-wiggle">
              <div className="srm-sprite srm-sprite-cat" style={{ backgroundImage: `url(${catSprite.src})`, ...(catSprite.offsetY ? { transform: `scale(0.65) translateY(${catSprite.offsetY}px)` } : {}) }} aria-label="Cat tower" />
            </div>
            <div className="srm-sprite-wiggle srm-sprite-wiggle-delay">
              <div className="srm-sprite" style={{ backgroundImage: `url(${dogSprite.src})`, ...(dogSprite.offsetY ? { transform: `translateY(${dogSprite.offsetY}px)` } : {}) }} aria-label="Dog tower" />
            </div>
          </div>
          <h1 className="srm-title">ScratchyTD</h1>
          <p className="srm-subtitle">Public Roadmap</p>
          <p className="srm-desc">{staticData.meta.description}</p>
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
                            <BoardCard key={cardKey(item)} item={item} onSelect={openItem} columns={boardData.columns} />
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
                        <BoardCard key={cardKey(item)} item={item} onSelect={openItem} columns={boardData.columns} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <BoardCardModal item={selectedItem} columns={boardData?.columns ?? []} onClose={closeItem} />

            {!boardData && !boardError && (
              <div className="srm-loader" aria-label="Loading board data">
                <div className="srm-loader-paws">
                  <span className="srm-loader-paw" style={{ animationDelay: '0s' }}>🐾</span>
                  <span className="srm-loader-paw" style={{ animationDelay: '0.2s' }}>🐾</span>
                  <span className="srm-loader-paw" style={{ animationDelay: '0.4s' }}>🐾</span>
                </div>
                <p className="srm-loader-text">Fetching the board<span className="srm-loader-dots"></span></p>
              </div>
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

// --- Board Card Component (compact) ---

function BoardCard({ item, onSelect, columns }: { item: BoardItem; onSelect: (item: BoardItem, el: HTMLElement | null) => void; columns: string[] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const statusColor = item.status ? getColumnColor(item.status, columns) : '#8B6F5E';

  const open = () => onSelect(item, cardRef.current);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  return (
    <div
      ref={cardRef}
      className="srm-card"
      style={{ ['--card-status' as any]: statusColor }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${item.title}`}
      onClick={open}
      onKeyDown={handleKey}
    >
      <div className="srm-card-top">
        <span className="srm-card-title">{item.title}</span>
        {item.number != null && <span className="srm-card-number">#{item.number}</span>}
      </div>
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
        <div className="srm-card-assignees srm-card-assignees-stack">
          {item.assignees.map(a => (
            <img
              key={a.login}
              src={a.avatarUrl}
              alt={a.login}
              title={a.login}
              className="srm-card-avatar"
              width={24}
              height={24}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Board Card Modal ---

function BoardCardModal({ item, columns, onClose }: { item: BoardItem | null; columns: string[]; onClose: () => void }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;

  const statusColor = item.status ? getColumnColor(item.status, columns) : '#8B6F5E';
  const extraFields = Object.entries(item.fields).filter(
    ([k]) => k.toLowerCase() !== 'status' && k.toLowerCase() !== 'title'
  );

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="srm-modal-backdrop" onClick={onBackdropClick}>
      <div
        className="srm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="srm-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="srm-modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        <header className="srm-modal-header">
          {item.status && (
            <span className="srm-modal-status-pill" style={{ background: statusColor }}>
              {item.status}
            </span>
          )}
          <h2 id="srm-modal-title" className="srm-modal-title">{item.title}</h2>
          {item.number != null && <span className="srm-modal-number">#{item.number}</span>}
        </header>

        {item.labels.length > 0 && (
          <div className="srm-modal-tags">
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

        {item.body ? (
          <div
            className="srm-modal-body srm-md"
            dangerouslySetInnerHTML={{ __html: renderMarkdownBody(item.body) }}
          />
        ) : (
          <div className="srm-modal-body">
            <em className="srm-modal-empty">No description.</em>
          </div>
        )}

        {item.assignees.length > 0 && (
          <section className="srm-modal-assignees">
            <div className="srm-modal-section-label">Assignees</div>
            <div className="srm-modal-assignees-list">
              {item.assignees.map(a => (
                <a
                  key={a.login}
                  href={a.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="srm-modal-assignee"
                >
                  <img src={a.avatarUrl} alt={a.login} className="srm-modal-avatar" width={28} height={28} />
                  <span className="srm-modal-assignee-name">{a.login}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {extraFields.length > 0 && (
          <dl className="srm-modal-fields">
            {extraFields.map(([k, v]) => (
              v != null && (
                <div key={k} className="srm-modal-field">
                  <dt>{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              )
            ))}
          </dl>
        )}

        {item.url && (
          <a
            className="srm-modal-github"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub →
          </a>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps<ScratchyTDRoadmapProps> = async () => {
  return {
    props: { roadmapData: defaultRoadmapData },
  };
};
