import useSWR from 'swr'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import MainLayout from '@/components/layouts/MainLayout'
import { controllerContract } from '@/lib/ethereum/public'

type PageProps = {
  tokenId: number
}

const Page: NextPage<PageProps> = ({ tokenId }) => {
  // TODO: call museTimeContract.tokenURI instead of call controllerContract

  const fetcher = async (tokenId: string) => {
    const [tokenURI, timeToken] = await Promise.all([
      controllerContract.tokenURI(+tokenId),
      controllerContract.timeTokenOf(+tokenId),
    ])
    const [valueInWei, topicOwner, topicSlug, arId, status] = timeToken
    return { tokenURI, valueInWei, topicOwner, topicSlug, arId, status }
  }
  const { data, isValidating } = useSWR(tokenId.toString(), fetcher, {
    revalidateOnFocus: false,
  })

  const { tokenURI, valueInWei, topicOwner, topicSlug, arId, status } = data ?? {}

  return (
    <MainLayout>
      <Head>
        <title>MuseTime</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>tokenURI: {tokenURI}</div>
        <div>valueInWei: {+valueInWei}</div>
        <div>topicOwner: {topicOwner}</div>
        <div>topicSlug: {topicSlug}</div>
        <div>arId: {arId}</div>
        <div>status: {+status}</div>
      </main>
    </MainLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async function ({ query }) {
  const tokenId = +(query.tokenId as string)
  return {
    props: {
      tokenId
    }
  }
}

export default Page
