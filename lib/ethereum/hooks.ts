import useSWR from 'swr'
import { ethers } from 'ethers'
import { useCallback, useState, useEffect } from 'react'
import { useEthereumContext } from '@/lib/ethereum/context'
import { chainId, publicProvider, controllerContract } from '@/lib/ethereum/public'
import type { TimeTroveData } from '@/lib/ethereum/types'

export function useTimeTrove(topicOwner: string): {
  timeTrove: TimeTroveData,
  createTimeTrove: (() => void),
  isValidating: boolean
} {
  const { authToken, signer } = useEthereumContext()

  /**
   * create time trove
   */
  const createTimeTrove = useCallback(() => {
    fetch('/api/ethereum/createTimeTroveParams', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
      },
    }).then(async (res) => {
      const { arOwnerAddress, signature } = (await res.json()) as { arOwnerAddress: string, signature: string }
      const tx = await controllerContract.connect(signer).createTimeTrove(arOwnerAddress, signature)
      await tx.wait()
    }).catch((err) => {
      console.log(err)
    })
  }, [authToken, signer])

  /**
   * get time trove
   */
  const fetcher = async (topicOwner: string) => {
    const timeTrove: TimeTroveData = await controllerContract.timeTroveOf(topicOwner)
    return timeTrove
  }
  const {
    data: timeTrove,
    isValidating
  } = useSWR<TimeTroveData>(topicOwner, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    timeTrove: timeTrove ?? { arOwnerAddress: '', balance: 0 },
    createTimeTrove: createTimeTrove,
    isValidating: isValidating,
  }
}

export type TimeTokenMintedLog = {
  topicOwner: string,
  topicSlug: string,
  tokenId: number,
  tokenOwner: string,
}

export function useTimeToken(topicOwner: string, topicSlug?: string): {
  mintTimeToken: (() => void),
  timeTokenMintedLogs: TimeTokenMintedLog[],
} {
  const { authToken, signer } = useEthereumContext()

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
  const mintTimeToken = useCallback(() => {
    if (!topicSlug) {
      console.log('topicSlug not set')
      return
    }
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
      const { valueInWei, topicOwner, topicSlug, arId, signature } = (await res.json()) as {
        valueInWei: string,
        topicOwner: string,
        topicSlug: string,
        arId: string,
        signature: string,
      }
      // const _valueInWei = ethers.BigNumber.from(valueInWei)
      const tx = await controllerContract
        .connect(signer)
        .mintTimeToken(valueInWei, topicOwner, topicSlug, arId, signature, { value: valueInWei })
      await tx.wait()
    }).catch((err) => {
      console.log(err)
    })
  }, [authToken, signer, topicOwner, topicSlug])

  return {
    mintTimeToken: mintTimeToken,
    timeTokenMintedLogs: timeTokenMintedLogs,
  }
}
