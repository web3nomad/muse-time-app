import useSWR from 'swr'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import MainLayout from '@/components/layouts/MainLayout'
import { controllerContract, nftContract } from '@/lib/ethereum/public'
import type { TimeToken } from '@/lib/ethereum/types'

type PageProps = {
  tokenId: number
}

const Page: NextPage<PageProps> = ({ tokenId }) => {
  // TODO: call museTimeContract.tokenURI instead of call controllerContract

  const fetcher = async (tokenId: string) => {
    const [tokenURI, timeToken]: [string, TimeToken] = await Promise.all([
      nftContract.tokenURI(+tokenId),
      controllerContract.timeTokenOf(+tokenId),
    ])
    return {
      tokenURI,
      ...timeToken,
    }
  }
  const { data, error } = useSWR<TimeToken & {tokenURI: string}>(tokenId.toString(), fetcher, {
    revalidateOnFocus: false,
  })
  const { tokenURI, valueInWei, topicOwner, topicSlug, arId, status } = data ?? {}

  const fetcher2 = async (tokenURI: string) => {
    const url = tokenURI.replace(/^https:\/\/musetime\.xyz/, '')
    const metadata = fetch(url).then(res => res.json())
    return metadata
  }

  const { data: tokenMetadata } = useSWR<{image:string}>(tokenURI, fetcher2, {
    revalidateOnFocus: false,
  })

  return (
    <MainLayout>
      <Head>
        <title>MuseTime</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {error && <div>{error.toString()}</div>}
        <div>tokenURI: {tokenURI}</div>
        <div>valueInWei: {+(valueInWei??'0').toString()}</div>
        <div>topicOwner: {topicOwner}</div>
        <div>topicSlug: {topicSlug}</div>
        <div>arId: {arId}</div>
        <div>status: {status}</div>
        {tokenMetadata && <picture className="block w-[600px]">
          <img src={tokenMetadata.image} alt="" />
        </picture>}
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
