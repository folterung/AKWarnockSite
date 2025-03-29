import React from 'react'
import Head from 'next/head'
import Home from '../components/Home'
import { homeInfo } from '../data/home'
import { GetStaticProps } from 'next'

interface HomePageProps {
  homeInfo: typeof homeInfo
}

export default function Index({ homeInfo }: HomePageProps) {
  return (
    <>
      <Head>
        <title>{homeInfo.title}</title>
        <meta name="description" content={homeInfo.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Home homeInfo={homeInfo} />
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      homeInfo,
    },
  }
} 