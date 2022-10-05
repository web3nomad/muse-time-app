import { ethers } from 'ethers'
import React, { useCallback } from 'react'
import { EditSquareIcon, CoffeeIcon, CalendarIcon } from '@/components/icons'
import { TrashIcon } from '@heroicons/react/20/solid'
import type { TopicData } from '@/lib/arweave'

export const formatEthersValue = (value: string) => {
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
  onClick,
  onClickEdit,
  onClickDelete,
}: {
  topic: TopicData,
  canEditTopics: boolean,
  onClick: () => void,
  onClickEdit: () => void,
  onClickDelete: () => void,
}) {
  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onClick()
  }, [onClick])

  const handleClickEdit = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onClickEdit()
  }, [onClickEdit])

  const handleClickDelete = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onClickDelete()
  }, [onClickDelete])

  return (
    <div className="relative p-4 bg-brown-grullo hover:bg-neutral-800 transition-colors text-white rounded">
      <div className="flex items-center font-din-alternate">
        <span className="text-lg">{formatEthersValue(topic.value)}</span>
        <span className="ml-1 text-xs opacity-70">(approx. {topic.duration || '-'})</span>
      </div>
      <div className="text-lg font-medium cursor-pointer" onClick={handleClick}>
        <span className="opacity-70"># </span>
        <span>{topic.name}</span>
      </div>
      <div className="my-1 text-sm font-din-pro opacity-80 leading-[1.2rem] h-[2.4rem] line-clamp-2">
        {topic.description}
      </div>
      <div className="my-3 flex items-center justify-start font-din-alternate">
        <div className="px-3 py-1 rounded-full bg-blue-cadet text-neutral-900 text-xs">
          {topic.method || '-'}
        </div>
        <div className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 text-xs ml-1">
          {topic.category || '-'}
        </div>
      </div>
      <div className="h-[1px] my-4 bg-white opacity-10">
        {/* divider */}
      </div>
      <div className="flex items-center justify-start font-din-alternate">
        <div className="px-2 py-1 rounded-md border border-white/80 text-sm flex items-center">
          <CoffeeIcon className="w-4 h-4 mr-1" />
          <span>{0} Minted</span>
        </div>
        <div className="px-2 py-1 rounded-md border border-white/80 text-sm flex items-center ml-3">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>{0} Pending</span>
        </div>
      </div>
      {/*<div className="text-xs text-ellipsis overflow-hidden">{topic.id}</div>*/}
      {canEditTopics && (
        <div className="absolute right-3 top-3 flex items-center justify-end">
          <span className="p-1 ml-1 cursor-pointer" onClick={handleClickEdit}>
            <EditSquareIcon className="w-4 h-4" />
          </span>
          <span className="p-1 ml-1 cursor-pointer" onClick={handleClickDelete}>
            <TrashIcon className="w-4 h-4" />
          </span>
        </div>
      )}
    </div>
  )
}
