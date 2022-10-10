import Head from 'next/head'
import Cover from '@/assets/images/musetime-cover.jpg'
const TITLE = 'MuseTime'
const DESCRIPTION = 'MuseTime is a time x space trading tool built on Arweave and Ethereum. In this high-dimensional world, time and space can be freely transformed.'

export default function HeadMeta() {
  return (
    <Head>
      <title>MuseTime</title>
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:site_name" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:image" content={'https://musetime.xyz' + Cover.src} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={'https://musetime.xyz' + Cover.src} />
      <meta name="description" content={DESCRIPTION} />
    </Head>
  )
}
