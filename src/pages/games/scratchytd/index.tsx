import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ScratchyTD() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>ScratchyTD | A.K. Warnock</title>
        <meta name="description" content="ScratchyTD — the cutest cats vs dogs tower defense game! Build towers, defend your turf, and battle adorable enemies." />
      </Head>

      <div className={`scratchy-landing ${mounted ? 'scratchy-mounted' : ''}`}>
        {/* Floating paw decorations */}
        <div className="scratchy-paw scratchy-paw-1" aria-hidden="true">🐾</div>
        <div className="scratchy-paw scratchy-paw-2" aria-hidden="true">🐾</div>
        <div className="scratchy-paw scratchy-paw-3" aria-hidden="true">🐾</div>
        <div className="scratchy-paw scratchy-paw-4" aria-hidden="true">🐾</div>
        <div className="scratchy-paw scratchy-paw-5" aria-hidden="true">🐾</div>

        {/* Back to main site */}
        <nav className="scratchy-nav">
          <Link href="/games" className="scratchy-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Games
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="scratchy-hero">
          <div className="scratchy-hero-inner">
            <div className="scratchy-hero-icons">
              <span className="scratchy-wiggle-icon">🐱</span>
              <span className="scratchy-wiggle-icon scratchy-wiggle-delay">🐶</span>
            </div>
            <h1 className="scratchy-title">
              Scratchy<span className="scratchy-title-accent">TD</span>
            </h1>
            <p className="scratchy-tagline">The Cutest Tower Defense Game Ever</p>
            <div className="scratchy-divider" aria-hidden="true">
              <span>🐾</span>
              <span>🐾</span>
              <span>🐾</span>
            </div>
            <p className="scratchy-description">
              Cats vs Dogs in the ultimate battle for backyard supremacy! Build adorable towers,
              defend against waves of fluffy enemies, and discover the cutest chaos a tower defense
              game has ever seen.
            </p>
          </div>
        </header>

        {/* Feature Cards */}
        <section className="scratchy-features">
          <div className="scratchy-feature-card scratchy-feature-towers">
            <div className="scratchy-feature-icon">🗼</div>
            <h3 className="scratchy-feature-title">Unique Towers</h3>
            <p className="scratchy-feature-text">
              Laser Pointers, Yarn Ball Cannons, Treat Dispensers — every tower is packed with personality and upgrades.
            </p>
          </div>
          <div className="scratchy-feature-card scratchy-feature-enemies">
            <div className="scratchy-feature-icon">🐕</div>
            <h3 className="scratchy-feature-title">Adorable Enemies</h3>
            <p className="scratchy-feature-text">
              Corgi rushes, Maine Coon tanks, puppy swarms, and epic bosses like General Woofs await.
            </p>
          </div>
          <div className="scratchy-feature-card scratchy-feature-maps">
            <div className="scratchy-feature-icon">🗺️</div>
            <h3 className="scratchy-feature-title">Creative Maps</h3>
            <p className="scratchy-feature-text">
              From suburban backyards to pet shops — each map has unique hazards, paths, and surprises.
            </p>
          </div>
        </section>

        {/* Status Banner */}
        <section className="scratchy-status">
          <div className="scratchy-status-inner">
            <div className="scratchy-status-badge">Coming Soon</div>
            <p className="scratchy-status-text">
              ScratchyTD is currently in development. Open Beta launches <strong>April 15, 2026</strong> with
              15 playable levels. Full launch with 25 levels, boss fights, and upgrades coming <strong>June 2026</strong>.
            </p>
          </div>
        </section>

        {/* Roadmap CTA */}
        <section className="scratchy-cta-section">
          <h2 className="scratchy-cta-heading">Follow Our Progress</h2>
          <p className="scratchy-cta-text">
            See what we&apos;re building, what&apos;s shipping next, and vote on community ideas.
          </p>
          <Link href="/games/scratchytd/roadmap" className="scratchy-cta-button">
            <span className="scratchy-cta-button-icon">🐾</span>
            View the Roadmap
            <span className="scratchy-cta-button-icon">🐾</span>
          </Link>
        </section>

        {/* Placeholder for future game images */}
        <section className="scratchy-gallery">
          <div className="scratchy-gallery-placeholder">
            <span className="scratchy-gallery-icon">📸</span>
            <p>Screenshots &amp; gameplay footage coming soon!</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="scratchy-footer">
          <p>Made with 🐾 by <Link href="/" className="scratchy-footer-link">A.K. Warnock</Link></p>
        </footer>
      </div>
    </>
  );
}
