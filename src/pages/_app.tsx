import '../styles/globals.css'
import '../styles/scratchytd.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Cormorant_Garamond } from 'next/font/google'
import ToastProvider from '../components/ToastProvider'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'block',
  preload: true,
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={cormorant.className}>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/ak-favicon.svg" />
      </Head>
      <Component {...pageProps} />
      <ToastProvider />
    </div>
  )
}
