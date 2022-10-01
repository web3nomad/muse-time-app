import type { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import type { TopicData } from '@/lib/arweave'
import { ArweaveResourceType, getArweaveData } from '@/lib/arweave'
import MainLayout from '@/components/layouts/MainLayout'
import TransitionDialog from '@/components/TransitionDialog'
import TopicForm from '@/components/topics/TopicForm'

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
        {addressSlug === walletAddress && (
          <span className="p-2 ml-2 cursor-pointer" onClick={() => setDialogOpen(true)}>
            <PencilSquareIcon className="w-6 h-6" />
          </span>
        )}
      </h3>
      {topic ? (
        <>
          <div>{topic.name}</div>
          <div>{topic.description}</div>
          <div>{topic.category}</div>
          <div>{topic.value}</div>
          <div>{topic.duration}</div>
          {addressSlug === walletAddress && (
            <TransitionDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <TopicForm topic={topic} onSave={onSaveSuccess} />
            </TransitionDialog>
          )}
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
