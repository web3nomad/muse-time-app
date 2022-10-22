import useSWR from 'swr'
import { ethers } from 'ethers'
import { useCallback, useState, useEffect } from 'react'
import { useEthereumContext } from '@/lib/ethereum/context'
import { chainId, publicProvider, controllerContract } from '@/lib/ethereum/public'
import type { TimeTroveData, TimeTokenMintedLog } from '@/lib/ethereum/types'
import type { MintParamsResult } from '@/pages/api/ethereum/mintParams'
import { bytes32ToBase64Url, base64UrlToBytes32 } from '@/lib/utils'

export function useTimeTrove(topicOwner: string): {
  timeTrove: TimeTroveData,
  isFetching: boolean,
  createTimeTrove: (() => void),
  isCreating: boolean,
} {
  const { authToken, signer, sendTransaction } = useEthereumContext()

  /**
   * get time trove
   */
  const [isFetching, setIsFetching] = useState(false)
  const [timeTrove, setTimeTrove] = useState<TimeTroveData|null>(null)
  const fetchTimeTrove = useCallback(async () => {
    setIsFetching(true)
    try {
      const timeTrove: TimeTroveData = await controllerContract.timeTroveOf(topicOwner)
      const arOwnerAddress = bytes32ToBase64Url(timeTrove.arOwnerAddress)
      setTimeTrove({
        arOwnerAddress: arOwnerAddress,
        balance: timeTrove.balance,
      })
    } catch(err) {
      setTimeTrove(null)
      console.log(err)
    }
    setIsFetching(false)
  }, [setIsFetching, setTimeTrove, topicOwner])
  useEffect(() => {
    fetchTimeTrove()
  }, [fetchTimeTrove])

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
      const {
        arOwnerAddress, topicOwner, signature
      } = (await res.json()) as { arOwnerAddress: string, topicOwner: string, signature: string }
      const params = [{ arOwnerAddress, topicOwner, signature }]
      // const params = await res.json()
      const method = controllerContract.connect(signer).createTimeTroves(params)
      await sendTransaction(method)
      setIsCreating(false)
      fetchTimeTrove()
    }).catch((err) => {
      console.log(err)
      setIsCreating(false)
    })
  }, [authToken, signer, sendTransaction, setIsCreating, fetchTimeTrove])

  return {
    timeTrove: timeTrove ?? { arOwnerAddress: '', balance: 0 },
    isFetching: isFetching,
    createTimeTrove: createTimeTrove,
    isCreating: isCreating,
  }
}

export function useTimeToken(topicOwner: string, topicId?: string): {
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
    const event = controllerContract.filters.TimeTokenMinted(
      topicOwner,
      topicId ? base64UrlToBytes32(topicId) : null,
      null
    )
    const startBlock = +(process.env.NEXT_PUBLIC_LOG_START_BLOCK ?? '15537393')
    controllerContract.queryFilter(event, startBlock).then(async (logs) => {
      const tokens = logs.map((log: any) => ({
        topicOwner: log.args.topicOwner,
        profileArId: bytes32ToBase64Url(log.args.profileArId),
        topicsArId: bytes32ToBase64Url(log.args.topicsArId),
        topicId: bytes32ToBase64Url(log.args.topicId),
        tokenId: +log.args.tokenId,
        tokenOwner: log.args.tokenOwner,
      }))
      setTimeTokenMintedLogs(tokens)
    })
  }, [topicOwner, topicId, setTimeTokenMintedLogs])

  useEffect(() => {
    listTimeTokenMinted()
  }, [listTimeTokenMinted])

  /**
   * mint time token
   */
  const [isMinting, setIsMinting] = useState<boolean>(false)
  const mintTimeToken = useCallback(() => {
    if (!topicId) {
      console.log('topicId not set')
      return
    }
    setIsMinting(true)
    fetch('/api/ethereum/mintParams', {
      method: 'POST',
      body: JSON.stringify({
        topicOwner,
        topicId,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
      },
    }).then(async (res) => {
      const {
        expired,
        valueInWei,
        profileArId,
        topicsArId,
        topicId,
        topicOwner,
        signature,
      } = (await res.json()) as MintParamsResult
      // const _valueInWei = ethers.BigNumber.from(valueInWei)
      const method = controllerContract.connect(signer).mintTimeToken(
        expired, valueInWei, profileArId, topicsArId, topicId, topicOwner, signature,
        { value: valueInWei }
      )
      await sendTransaction(method)
      setIsMinting(false)
    }).catch((err) => {
      console.log(err)
      setIsMinting(false)
    })
  }, [authToken, signer, sendTransaction, topicOwner, topicId, setIsMinting])

  return {
    timeTokenMintedLogs: timeTokenMintedLogs,
    mintTimeToken: mintTimeToken,
    isMinting: isMinting,
  }
}
