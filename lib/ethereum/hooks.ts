import useSWR from 'swr'
import { ethers } from 'ethers'
import { useCallback, useState, useEffect } from 'react'
import { useEthereumContext } from '@/lib/ethereum/context'
import { chainId, publicProvider, controllerContract } from '@/lib/ethereum/public'
import type { TimeTroveData } from '@/lib/ethereum/types'

export function useTimeTrove(topicOwner: string): {
  timeTrove: TimeTroveData,
  isFetching: boolean,
  createTimeTrove: (() => void),
  isCreating: boolean,
} {
  const { authToken, signer, sendTransaction } = useEthereumContext()

  /**
   * create time trove
   */
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const createTimeTrove = useCallback(() => {
    setIsCreating(true)
    fetch('/api/ethereum/createTimeTroveParams', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
      },
    }).then(async (res) => {
      const { arOwnerAddress, signature } = (await res.json()) as { arOwnerAddress: string, signature: string }
      const method = controllerContract.connect(signer).createTimeTrove(arOwnerAddress, signature)
      sendTransaction(method)
      setIsCreating(false)  // !!! should set after transaction is confirmed
      // const tx = await controllerContract.connect(signer).createTimeTrove(arOwnerAddress, signature)
      // await tx.wait()
    }).catch((err) => {
      console.log(err)
      setIsCreating(false)
    })
  }, [authToken, signer, sendTransaction, setIsCreating])

  /**
   * get time trove
   */
  const fetcher = async (topicOwner: string) => {
    const timeTrove: TimeTroveData = await controllerContract.timeTroveOf(topicOwner)
    return timeTrove
  }
  const {
    data: timeTrove,
    isValidating: isFetching,
  } = useSWR<TimeTroveData>(topicOwner, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    timeTrove: timeTrove ?? { arOwnerAddress: '', balance: 0 },
    isFetching: isFetching,
    createTimeTrove: createTimeTrove,
    isCreating: isCreating,
  }
}

export type TimeTokenMintedLog = {
  topicOwner: string
  topicSlug: string
  tokenId: number
  tokenOwner: string
}

export function useTimeToken(topicOwner: string, topicSlug?: string): {
  timeTokenMintedLogs: TimeTokenMintedLog[],
  mintTimeToken: (() => void),
  isMinting: boolean,
} {
  const { authToken, signer, sendTransaction } = useEthereumContext()

  const [timeTokenMintedLogs, setTimeTokenMintedLogs] = useState<TimeTokenMintedLog[]>([])

  /**
   *  list time token mint
   */
  const listTimeTokenMinted = useCallback(() => {
    const event = controllerContract.filters.TimeTokenMinted(topicOwner, topicSlug ?? null, null)
    controllerContract.queryFilter(event, 15537393).then(async (logs) => {
      const tokens = logs.map((log: any) => ({
        topicOwner: log.args.topicOwner,
        topicSlug: log.args.topicSlug,
        tokenId: +log.args.tokenId,
        tokenOwner: log.args.tokenOwner,
      }))
      setTimeTokenMintedLogs(tokens)
    })
  }, [topicOwner, topicSlug, setTimeTokenMintedLogs])

  useEffect(() => {
    listTimeTokenMinted()
  }, [listTimeTokenMinted])

  /**
   * mint time token
   */
  const [isMinting, setIsMinting] = useState<boolean>(false)
  const mintTimeToken = useCallback(() => {
    if (!topicSlug) {
      console.log('topicSlug not set')
      return
    }
    setIsMinting(true)
    fetch('/api/ethereum/mintParams', {
      method: 'POST',
      body: JSON.stringify({
        topicOwner,
        topicSlug,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
      },
    }).then(async (res) => {
      const { valueInWei, topicOwner, topicSlug, topicsArId, signature } = (await res.json()) as {
        valueInWei: string,
        topicOwner: string,
        topicSlug: string,
        topicsArId: string,
        signature: string,
      }
      // const _valueInWei = ethers.BigNumber.from(valueInWei)
      const method = controllerContract.connect(signer).mintTimeToken(
        valueInWei, topicOwner, topicSlug, topicsArId, signature,
        { value: valueInWei }
      )
      sendTransaction(method)
      setIsMinting(false)
    }).catch((err) => {
      console.log(err)
      setIsMinting(false)
    })
  }, [authToken, signer, sendTransaction, topicOwner, topicSlug, setIsMinting])

  return {
    timeTokenMintedLogs: timeTokenMintedLogs,
    mintTimeToken: mintTimeToken,
    isMinting: isMinting,
  }
}
