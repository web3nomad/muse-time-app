import { useEffect, useState, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import type { TopicData } from '@/lib/arweave'
import { ArweaveResourceType, getArweaveData } from '@/lib/arweave'
import TransitionDialog from '@/components/TransitionDialog'
import TopicForm from './TopicForm'


export default function TopicsList({ resourceOwner }: {
  resourceOwner: string
}) {
  const walletAddress = useRecoilValue(walletAddressState)
  const [topic, setTopic] = useState<TopicData|null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchTopics = useCallback(() => {
    getArweaveData({
      resourceId: '',
      resourceType: ArweaveResourceType.TOPICS,
      resourceOwner: resourceOwner
    }).then(data => {
      setTopic(data)
    })
  }, [setTopic, resourceOwner])

  const onSaveSuccess = useCallback((data: TopicData) => {
    setDialogOpen(false)
    setTopic(data)
  }, [setDialogOpen, setTopic])

  useEffect(() => fetchTopics(), [fetchTopics])

  return (
    <div>
      {/**/}
    </div>
  )
}
