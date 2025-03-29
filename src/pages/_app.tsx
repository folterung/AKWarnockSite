import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import ToastProvider from '../components/ToastProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/ak-favicon.svg" />
      </Head>
      <Component {...pageProps} />
      <ToastProvider />
    </>
  )
} 