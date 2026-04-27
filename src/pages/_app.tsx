import '../styles/globals.css'
import '../styles/scratchytd.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Cormorant_Garamond } from 'next/font/google'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ToastProvider from '../components/ToastProvider'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'block',
  preload: true,
})

type HomeHeroWindow = Window & {
  __homeHeroReady?: boolean;
};

let hasShownAppIntro = false;

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [fontsReady, setFontsReady] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [homeHeroReady, setHomeHeroReady] = useState(false);
  const [introVisible, setIntroVisible] = useState(() => !hasShownAppIntro);
  const shouldWaitForHomeHero = router.pathname === '/';

  useEffect(() => {
    if (!introVisible) {
      return;
    }

    hasShownAppIntro = true;

    const minIntroTimer = window.setTimeout(() => {
      setIntroReady(true);
    }, 900);
    const maxIntroTimer = window.setTimeout(() => {
      setFontsReady(true);
      setHomeHeroReady(true);
      setIntroReady(true);
    }, 3600);
    const markHomeHeroReady = () => setHomeHeroReady(true);
    const currentWindow = window as HomeHeroWindow;

    if (currentWindow.__homeHeroReady) {
      setHomeHeroReady(true);
    }

    window.addEventListener('home-hero-ready', markHomeHeroReady);

    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        setFontsReady(true);
      });
    } else {
      setFontsReady(true);
    }

    return () => {
      window.clearTimeout(minIntroTimer);
      window.clearTimeout(maxIntroTimer);
      window.removeEventListener('home-hero-ready', markHomeHeroReady);
    };
  }, [introVisible]);

  useEffect(() => {
    if (!introVisible) {
      return;
    }

    if (!router.isReady || !introReady || !fontsReady || (shouldWaitForHomeHero && !homeHeroReady)) {
      return;
    }

    const exitTimer = window.setTimeout(() => {
      setIntroVisible(false);
    }, 120);

    return () => window.clearTimeout(exitTimer);
  }, [fontsReady, homeHeroReady, introReady, introVisible, router.isReady, shouldWaitForHomeHero]);

  return (
    <div className={cormorant.className}>
      <div className={`home-boot-curtain ${introVisible ? '' : 'home-boot-curtain--hidden'}`} aria-hidden="true">
        <div className="home-boot-curtain__glow" />
        <div className="home-boot-curtain__content">
          <div className="home-boot-curtain__mark">AK WARNOCK</div>
          <div className="home-boot-curtain__line" />
        </div>
      </div>

      <Head>
        <link rel="icon" type="image/svg+xml" href="/ak-favicon.svg" />
      </Head>
      <Component {...pageProps} />
      <ToastProvider />
    </div>
  )
}
