import clsx from 'clsx'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { TimeTokenMintedLog } from '@/lib/ethereum/hooks'
import { controllerContract } from '@/lib/ethereum/public'
import type { TimeTokenData } from '@/lib/ethereum/types'
import type { TopicData } from '@/lib/arweave'
import { bytes32ToBase64Url } from '@/lib/utils'
import ClockImage from '@/assets/images/clock.svg'

function TimeTokenItem({ tokenOwner, tokenId }: { tokenOwner: string, tokenId: number }) {
  const [token, setToken] = useState<(TimeTokenData & { topic: TopicData })|null>(null)

  useEffect(() => {
    controllerContract.timeTokenOf(tokenId).then(async (timeToken: TimeTokenData) => {
      const { topicOwner, valueInWei, status } = timeToken
      const profileArId = bytes32ToBase64Url(timeToken.profileArId)
      const topicsArId = bytes32ToBase64Url(timeToken.topicsArId)
      const topicId = bytes32ToBase64Url(timeToken.topicId)
      const topics: TopicData[] = await fetch(`https://arseed.web3infra.dev/${topicsArId}`).then(res => res.json())
      const topic = topics.find(({ id }) => id === topicId)
      setToken({
        topic: topic!,
        topicOwner,
        valueInWei,
        profileArId,
        topicsArId,
        topicId,
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

export default function MintedTimeTokens({ timeTokenMintedLogs }: {
  timeTokenMintedLogs: TimeTokenMintedLog[]
}) {
  const router = useRouter()

  const goToTokenDetail = useCallback((tokenId: number) => {
    router.push(`/time/${tokenId}`)
  }, [router])

  return (
    <section className="my-16">
      <h3 className="text-3xl font-bold my-4">Time NFTs Minted</h3>
      <div className="relative pl-8">
        {timeTokenMintedLogs.map(({tokenId, tokenOwner}) => (
          <div key={tokenId} className="relative rounded-md bg-neutral-100 mb-4 py-3 pl-20 pr-6">
            <div key={tokenId} onClick={() => goToTokenDetail(tokenId)} className="cursor-pointer">
              <div className="absolute left-5 top-0 h-full w-12">
                <Image src={ClockImage.src} layout="fill" alt="clock" />
              </div>
              <TimeTokenItem tokenId={tokenId} tokenOwner={tokenOwner} />
            </div>
            <div className="absolute -left-6 top-0 -bottom-4 border-l-[1px] border-dashed border-neutral-900"></div>
            <div className="absolute -left-6 -bottom-4 w-[7px] h-[7px] -ml-[3px] bg-neutral-900 rounded-full"></div>
          </div>
        ))}
        <div className={clsx(
          {'hidden': !timeTokenMintedLogs.length},
          "absolute left-2 top-0 w-[19px] h-[19px] -ml-[9px]",
          "bg-white rounded-full border-[7px] border-neutral-900"
        )}></div>
      </div>
      {!timeTokenMintedLogs.length && <>
        <div className="relative w-20 h-20 my-6">
          <Image src={ClockImage.src} layout="fill" alt="coffee" />
        </div>
        <div className="font-light text-sm">Time NFTs minted will show up here.</div>
      </>}
    </section>
  )
}
