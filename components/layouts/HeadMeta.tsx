import Head from 'next/head'
import Cover from '@/assets/images/musetime-cover-b.jpg'
const TITLE = 'MuseTime'
const DESCRIPTION = 'MuseTime is a time x space trading tool built on Arweave and Ethereum. In this high-dimensional world, time and space can be freely transformed.'

export default function HeadMeta({ title, description }: {
  title?: string,
  description?: string,
}) {
  return (
    <Head>
      <title>{title || TITLE}</title>
      <link rel="icon" href="/favicon.ico" />
      <meta name="og:site_name" property="og:site_name" content={title || TITLE} />
      <meta name="og:description" property="og:description" content={description || DESCRIPTION} />
      <meta name="og:title" property="og:title" content={title || TITLE} />
      <meta name="og:image" property="og:image" content={'https://musetime.xyz' + Cover.src} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || TITLE} />
      <meta name="twitter:description" content={description || DESCRIPTION} />
      <meta name="twitter:image" content={'https://musetime.xyz' + Cover.src} />
      <meta name="description" content={description || DESCRIPTION} />
    </Head>
  )
}
