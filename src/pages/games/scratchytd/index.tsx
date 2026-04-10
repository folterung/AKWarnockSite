import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { landingData as defaultLandingData } from '@/data/scratchytd-landing';

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

interface Feature {
  key: string;
  icon: string;
  title: string;
  text: string;
}

interface LandingData {
  meta: { title: string; description: string };
  hero: {
    icons: string[];
    title: string;
    titleAccent: string;
    tagline: string;
    dividerIcon: string;
    description: string;
  };
  features: Feature[];
  status: { badge: string; text: string };
  cta: {
    heading: string;
    text: string;
    buttonText: string;
    buttonIcon: string;
    buttonLink: string;
  };
  gallery: { icon: string; placeholderText: string };
  footer: { madeWithIcon: string; authorName: string; authorLink: string };
  decorations: { pawIcon: string; pawCount: number };
  nav: { backLink: string; backText: string };
}

interface ScratchyTDProps {
  landingData: LandingData;
}

export default function ScratchyTD({ landingData }: ScratchyTDProps) {
  const [mounted, setMounted] = useState(false);
  const [catSprite] = useState(() => pickRandom(CAT_SPRITES));
  const [dogSprite] = useState(() => pickRandom(DOG_SPRITES));
  const { meta, hero, features, status, cta, gallery, footer, decorations, nav } = landingData;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute sequential animation delays based on which sections are rendered
  const STEP = 0.15;
  let delay = 0.15; // hero starts here
  const heroDelay = delay;
  delay += STEP;

  const hasFeatures = features.length > 0;
  const featureBaseDelay = delay;
  if (hasFeatures) {
    delay += STEP * features.length;
  }

  const statusDelay = delay;
  delay += STEP;
  const ctaDelay = delay;
  delay += STEP;
  const galleryDelay = delay;

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Head>

      <div className={`scratchy-landing ${mounted ? 'scratchy-mounted' : ''}`}>
        {/* Floating paw decorations */}
        {Array.from({ length: decorations.pawCount }, (_, i) => (
          <div key={i} className={`scratchy-paw scratchy-paw-${i + 1}`} aria-hidden="true">
            {decorations.pawIcon}
          </div>
        ))}

        {/* Back to main site */}
        <nav className="scratchy-nav">
          <Link href={nav.backLink} className="scratchy-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {nav.backText}
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="scratchy-hero" style={{ animationDelay: `${heroDelay}s` }}>
          <div className="scratchy-hero-inner">
            <div className="scratchy-hero-icons">
              <div className="srm-sprite-wiggle">
                <div className="srm-sprite srm-sprite-lg srm-sprite-cat" style={{ backgroundImage: `url(${catSprite.src})`, ...(catSprite.offsetY ? { transform: `scale(0.65) translateY(${catSprite.offsetY}px)` } : {}) }} aria-label="Cat tower" />
              </div>
              <div className="srm-sprite-wiggle srm-sprite-wiggle-delay">
                <div className="srm-sprite srm-sprite-lg" style={{ backgroundImage: `url(${dogSprite.src})`, ...(dogSprite.offsetY ? { transform: `translateY(${dogSprite.offsetY}px)` } : {}) }} aria-label="Dog tower" />
              </div>
            </div>
            <h1 className="scratchy-title">
              {hero.title}<span className="scratchy-title-accent">{hero.titleAccent}</span>
            </h1>
            <p className="scratchy-tagline">{hero.tagline}</p>
            <div className="scratchy-divider" aria-hidden="true">
              <span>{hero.dividerIcon}</span>
              <span>{hero.dividerIcon}</span>
              <span>{hero.dividerIcon}</span>
            </div>
            <p className="scratchy-description">{hero.description}</p>
          </div>
        </header>

        {/* Feature Cards */}
        {hasFeatures && (
          <section className="scratchy-features">
            {features.map((feature, i) => (
              <div
                key={feature.key}
                className={`scratchy-feature-card scratchy-feature-${feature.key}`}
                style={{ animationDelay: `${featureBaseDelay + i * STEP}s` }}
              >
                <div className="scratchy-feature-icon">{feature.icon}</div>
                <h3 className="scratchy-feature-title">{feature.title}</h3>
                <p className="scratchy-feature-text">{feature.text}</p>
              </div>
            ))}
          </section>
        )}

        {/* Status Banner */}
        <section className="scratchy-status" style={{ animationDelay: `${statusDelay}s`, marginTop: hasFeatures ? '48px' : '0' }}>
          <div className="scratchy-status-inner">
            <div className="scratchy-status-badge">{status.badge}</div>
            <p className="scratchy-status-text" dangerouslySetInnerHTML={{ __html: status.text }} />
          </div>
        </section>

        {/* Roadmap CTA */}
        <section className="scratchy-cta-section" style={{ animationDelay: `${ctaDelay}s` }}>
          <h2 className="scratchy-cta-heading">{cta.heading}</h2>
          <p className="scratchy-cta-text">{cta.text}</p>
          <Link href={cta.buttonLink} className="scratchy-cta-button">
            <span className="scratchy-cta-button-icon">{cta.buttonIcon}</span>
            {cta.buttonText}
            <span className="scratchy-cta-button-icon">{cta.buttonIcon}</span>
          </Link>
        </section>

        {/* Placeholder for future game images */}
        <section className="scratchy-gallery" style={{ animationDelay: `${galleryDelay}s` }}>
          <div className="scratchy-gallery-placeholder">
            <span className="scratchy-gallery-icon">{gallery.icon}</span>
            <p>{gallery.placeholderText}</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="scratchy-footer">
          <p>Made with {footer.madeWithIcon} by <Link href={footer.authorLink} className="scratchy-footer-link">{footer.authorName}</Link></p>
        </footer>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<ScratchyTDProps> = async () => {
  return {
    props: { landingData: defaultLandingData },
  };
};
