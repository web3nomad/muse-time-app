import { ethers } from 'ethers'
import { EditSquareIcon, CoffeeIcon, CalendarIcon } from '@/components/icons'
import { TrashIcon } from '@heroicons/react/20/solid'
import type { TopicData } from '@/lib/arweave'

const formatEthersValue = (value: string) => {
  const [val, unit] = value.split(' ')
  try {
    const wei = ethers.utils.parseUnits(val, unit)
    return ethers.utils.formatEther(wei) + ' ETH'
  } catch(err) {
    // console.log(err)
    return 'INVALID VALUE'
  }
}

export default function TopicItem({
  topic,
  canEditTopics,
  onClickEdit,
  onClickDelete,
}: {
  topic: TopicData,
  canEditTopics: boolean,
  onClickEdit: (topic: TopicData) => void,
  onClickDelete: (topic: TopicData) => void,
}) {
  return (
    <div className="relative p-4 bg-brown-grullo hover:bg-neutral-800 transition-colors text-white rounded">
      <div className="flex items-center">
        <span className="text-lg font-medium">{formatEthersValue(topic.value)}</span>
        <span className="ml-1 text-xs opacity-70">(approx. {topic.duration || '-'})</span>
      </div>
      <div className="text-lg font-medium">
        <span className="opacity-70"># </span>
        <span>{topic.name}</span>
      </div>
      <div className="my-1 text-sm font-light opacity-80 leading-[1.2rem] h-[2.4rem] line-clamp-2">
        {topic.description}
      </div>
      <div className="my-3 flex items-center justify-start">
        <div className="px-3 py-1 rounded-full bg-blue-cadet text-neutral-900 text-xs font-medium">
          {topic.method || '-'}
        </div>
        <div className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 text-xs font-medium ml-1">
          {topic.category || '-'}
        </div>
      </div>
      <div className="h-[1px] my-4 bg-white opacity-10">
        {/* divider */}
      </div>
      <div className="flex items-center justify-start">
        <div className="px-2 py-1 rounded-md border border-white/80 text-xs leading-5 flex items-center">
          <CoffeeIcon className="w-4 h-4 mr-1" />
          <span>{0} Minted</span>
        </div>
        <div className="px-2 py-1 rounded-md border border-white/80 text-xs leading-5 flex items-center ml-3">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>{0} Pending</span>
        </div>
      </div>
      {/*<div className="text-xs text-ellipsis overflow-hidden">{topic.id}</div>*/}
      {canEditTopics && (
        <div className="absolute right-3 top-3 flex items-center justify-end">
          <span className="p-1 ml-1 cursor-pointer" onClick={() => onClickEdit(topic)}>
            <EditSquareIcon className="w-4 h-4" />
          </span>
          <span className="p-1 ml-1 cursor-pointer" onClick={() => onClickDelete(topic)}>
            <TrashIcon className="w-4 h-4" />
          </span>
        </div>
      )}
    </div>
  )
}
