import clsx from 'clsx'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useTimeToken } from '@/lib/ethereum/hooks'
import { controllerContract } from '@/lib/ethereum/public'
import type { TimeTokenData } from '@/lib/ethereum/types'
import type { TopicData } from '@/lib/arweave'

import Clock from '@/assets/images/clock.svg'

function TimeTokenItem({ tokenOwner, tokenId }: { tokenOwner: string, tokenId: number }) {
  const [token, setToken] = useState<(TimeTokenData & { topic: TopicData })|null>(null)

  useEffect(() => {
    controllerContract.timeTokenOf(tokenId).then(async (timeToken: TimeTokenData) => {
      const { valueInWei, topicOwner, topicSlug, arId, status } = timeToken
      const topics: TopicData[] = await fetch(`https://arseed.web3infra.dev/${arId}`).then(res => res.json())
      const topic = topics.find(({ id }) => id === topicSlug)
      setToken({
        topic: topic!,
        valueInWei,
        topicOwner,
        topicSlug,
        arId,
        status,
      })
    })
  }, [tokenId])

  return token ? (
    <div className="font-din-alternate">
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="text-neutral-500">{/*tokenId*/}4h ago</div>
        <div>{/*token.status*/}To confirm</div>
      </div>
      <div className="mb-1"># {token.topic.name}</div>
      <div className="text-sm text-neutral-400">{tokenOwner}</div>
    </div>
  ) : (<>Loading</>)
}

export default function MintedTimeTokens({ addressSlug, topicSlug }: {
  addressSlug: string,
  topicSlug?: string,
}) {
  const router = useRouter()
  const { timeTokenMintedLogs } = useTimeToken(addressSlug, topicSlug)

  const goToTokenDetail = useCallback((tokenId: number) => {
    router.push(`/time/${tokenId}`)
  }, [router])

  return (
    <section className={clsx({'hidden': !timeTokenMintedLogs.length}, "my-16")}>
      <h3 className="text-3xl font-bold my-4">Time NFTs Minted</h3>
      <div className="relative pl-8">
        {timeTokenMintedLogs.map(({tokenId, tokenOwner}) => (
          <div key={tokenId} className="relative rounded-md bg-neutral-100 mb-4 py-3 pl-20 pr-6">
            <div key={tokenId} onClick={() => goToTokenDetail(tokenId)} className="cursor-pointer">
              <div className="absolute left-5 top-0 h-full w-12">
                <Image src={Clock.src} layout="fill" alt="Clock Icon" />
              </div>
              <TimeTokenItem tokenId={tokenId} tokenOwner={tokenOwner} />
            </div>
            <div className="absolute -left-6 top-0 -bottom-4 border-l-[1px] border-dashed border-neutral-900"></div>
            <div className="absolute -left-6 -bottom-4 w-[7px] h-[7px] -ml-[3px] bg-neutral-900 rounded-full"></div>
          </div>
        ))}
        <div className={clsx(
          "absolute left-2 top-0 w-[19px] h-[19px] -ml-[9px]",
          "bg-white rounded-full border-[7px] border-neutral-900"
        )}></div>
      </div>
    </section>
  )
}
