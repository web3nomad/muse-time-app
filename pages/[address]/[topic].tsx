import type { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import type { TopicData } from '@/lib/arweave'
import { ArweaveResourceType, getArweaveData } from '@/lib/arweave'
import MainLayout from '@/components/layouts/MainLayout'

type PageProps = {
  topicSlug: string,
  addressSlug: string,
}

const Page: NextPage<PageProps> = ({ topicSlug, addressSlug }) => {
  const walletAddress = useRecoilValue(walletAddressState)
  const [topic, setTopic] = useState<TopicData|null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchTopic = useCallback(() => {
    getArweaveData({
      resourceId: topicSlug,
      resourceType: ArweaveResourceType.TOPIC,
      resourceOwner: addressSlug
    }).then(data => {
      setTopic(data)
    })
  }, [setTopic, addressSlug, topicSlug])

  const onSaveSuccess = useCallback((data: TopicData) => {
    setDialogOpen(false)
    setTopic(data)
  }, [setDialogOpen, setTopic])

  useEffect(() => fetchTopic(), [fetchTopic])

  return (
    <MainLayout>
      <Head>
        <title>{'Topic ' + topicSlug}</title>
      </Head>
      <h3 className="flex items-center">
        <span>{topicSlug}</span>
      </h3>
      {topic ? (
        <>
          <div>{topic.name}</div>
          <div>{topic.description}</div>
          <div>{topic.category}</div>
          <div>{topic.value}</div>
          <div>{topic.duration}</div>
        </>
      ) : <div>loading topic ...</div>}
    </MainLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async function ({ query }) {
  const topicSlug = query.topic as string
  const addressSlug = ethers.utils.getAddress(query.address as string)
  return {
    props: {
      topicSlug,
      addressSlug,
    }
  }
}

export default Page
