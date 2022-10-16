import { ethers } from 'ethers'
import base64url from 'base64url'
import Image from 'next/image'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useEthereumContext } from '@/lib/ethereum/context'
import type { TopicData } from '@/lib/arweave'
import { ResourceTypes, syncArweaveData, getArweaveData } from '@/lib/arweave'
import TransitionDialog from '@/components/TransitionDialog'
import { PlusCircleIcon } from '@/components/icons'
import TopicForm from './TopicForm'
import TopicItem from './TopicItem'
import CoffeeImage from '@/assets/images/coffee.svg'


const makeRandomId = () => {
  const rand = ethers.BigNumber.from(Date.now()).mul(1000000).add(Math.floor(Math.random() * 1000))
  const bytes32 = ethers.utils.sha256(ethers.utils.arrayify(rand))
  const id = base64url.encode(Buffer.from(ethers.utils.arrayify(bytes32)))
  // console.log(3, '0x' + base64url.toBuffer(id).toString('hex'))  // should be equal to bytes32
  return id
}

function makeEmptyNewTopic(topics: TopicData[]): TopicData {
  return {
    'id': makeRandomId(),
    'name': '',
    'description': '',
    'category': '',
    'method': '',
    'availability': '',
    'value': '',
    'duration': '',
  }
}

const pushOrMutateTopics = (topics: TopicData[], topic: TopicData) => {
  let newTopics: TopicData[] = []
  const index = topics.findIndex(({ id }) => topic.id === id)
  if (index >= 0) {
    newTopics = [
      ...topics.slice(0, index),
      { ...topic },
      ...topics.slice(index + 1),
    ]
  } else {
    newTopics = [ ...topics, topic ]
  }
  return newTopics
}

export default function TopicsList({ resourceOwner, arOwnerAddress }: {
  resourceOwner: string,
  arOwnerAddress: string,
}) {
  const router = useRouter()
  const { walletAddress, authToken, signer } = useEthereumContext()

  const [topics, setTopics] = useState<TopicData[]>([])
  const [editingTopic, setEditingTopic] = useState<TopicData|null>(null)
  const [pendingSync, setPendingSync] = useState(false)

  const canEditTopics = useMemo(() => {
    return resourceOwner === walletAddress
  }, [resourceOwner, walletAddress])

  const fetchTopics = useCallback(() => {
    getArweaveData({
      arOwnerAddress: arOwnerAddress,
      resourceId: '',
      resourceType: ResourceTypes.TOPICS,
      resourceOwner: resourceOwner
    }).then(topics => {
      setTopics(topics || [])
    })
  }, [setTopics, resourceOwner, arOwnerAddress])

  const syncTopics = useCallback((newTopics: TopicData[]) => {
    if (!walletAddress || !authToken) {
      return
    }
    setPendingSync(true)
    syncArweaveData({
      resourceId: '',
      resourceType: ResourceTypes.TOPICS,
      resourceOwner: walletAddress,
      payload: newTopics,
      authToken: authToken,
      web3Signer: signer,
    }).then((res) => {
      // update local state
      setTopics(newTopics)
      setPendingSync(false)
    }).catch((err) => {
      console.log(err)
      setPendingSync(false)
    })
  }, [walletAddress, authToken, signer, setPendingSync, setTopics])

  const handleSyncTopic = useCallback((topic: TopicData) => {
    // TODO: validate data
    setEditingTopic(null)
    const newTopics = pushOrMutateTopics(topics, topic)
    // sync on chain
    syncTopics(newTopics)
  }, [setEditingTopic, topics, syncTopics])

  const showNewTopicDialog = useCallback(() => {
    if (topics.length >= 4) {
      return
    }
    const newTopic = makeEmptyNewTopic(topics)
    setEditingTopic(newTopic)
  }, [topics, setEditingTopic])

  const showEditTopicDialog = useCallback((topic: TopicData) => {
    setEditingTopic({ ...topic })
  }, [setEditingTopic])

  const handleDeleteTopic = useCallback((topic: TopicData) => {
    const newTopics = topics.filter(({ id }) => id !== topic.id).slice(0,2).map((topic) => ({
      ...topic,
      id: makeRandomId()
    }))
    syncTopics(newTopics)
  }, [topics, syncTopics])

  const goToTopicDetail = useCallback((topic: TopicData) => {
    router.push(`/${resourceOwner}/${topic.id}`)
  }, [router, resourceOwner])

  useEffect(() => fetchTopics(), [fetchTopics])

  return (
    <section className="relative">
      <h3 className="text-3xl font-bold my-4">Time NFTs</h3>
      {canEditTopics && (
        <span className="absolute top-0 right-0 p-2 p-2 cursor-pointer" onClick={() => showNewTopicDialog()}>
          <PlusCircleIcon className="w-5 h-5" />
        </span>
      )}
      <div className="-m-2 flex items-start justify-between flex-wrap">
        {topics.map(topic => (
          <div className="p-2 w-full sm:w-1/2" key={topic.id}>
            <TopicItem
              topic={topic}
              canEditTopics={canEditTopics}
              onClick={() => goToTopicDetail(topic)}
              onClickEdit={() => showEditTopicDialog(topic)}
              onClickDelete={() => handleDeleteTopic(topic)}
            />
          </div>
        ))}
      </div>
      {!topics.length && (
        <div className="relative w-20 h-20 mt-6">
          <Image src={CoffeeImage.src} layout="fill" alt="coffee" />
        </div>
      )}
      <TransitionDialog open={!!editingTopic} onClose={() => setEditingTopic(null)}>
        {editingTopic && <TopicForm topic={editingTopic}
          onSubmit={handleSyncTopic} onCancel={() => setEditingTopic(null)} />}
      </TransitionDialog>
      <TransitionDialog open={pendingSync} onClose={() => {}}>
        <div>Confirm in metamask</div>
      </TransitionDialog>
    </section>
  )
}
