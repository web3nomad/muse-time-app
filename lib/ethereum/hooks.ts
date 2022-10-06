import useSWR from 'swr'
import { ethers } from 'ethers'
import { useCallback, useState, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { authTokenState } from '@/lib/recoil/wallet'
import {
  chainId,
  publicProvider,
  controllerContract
} from '@/lib/ethereum/public'

export const useEthereumSigner = () => {
  if (typeof window === 'undefined' || typeof (window as any).ethereum === 'undefined') {
    return new ethers.VoidSigner('0x0000000000000000000000000000000000000000')
  }
  if (+chainId !== +(window as any).ethereum.chainId) {
    console.log(new Error('Wrong chainId'))
    return new ethers.VoidSigner('0x0000000000000000000000000000000000000000')
  }
  const provider = new ethers.providers.Web3Provider((window as any).ethereum)
  const signer = provider.getSigner()
  return signer
}

type TimeTrove = {
  arOwnerAddress: string,
  balance: ethers.BigNumberish
}

export function useTimeTrove(topicOwner: string): {
  timeTrove: TimeTrove,
  createTimeTrove: (() => void),
  isValidating: boolean
} {
  const authToken = useRecoilValue(authTokenState)
  const ethereumSigner = useEthereumSigner()

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
      const tx = await controllerContract.connect(ethereumSigner).createTimeTrove(arOwnerAddress, signature)
      await tx.wait()
    }).catch((err) => {
      console.log(err)
    })
  }, [authToken, ethereumSigner])

  /**
   * get time trove
   */
  const fetcher = async (topicOwner: string) => {
    const [arOwnerAddress, balance] = await controllerContract.timeTroveOf(topicOwner)
    return { arOwnerAddress, balance } as TimeTrove
  }
  const {
    data: timeTrove,
    isValidating
  } = useSWR(topicOwner, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    timeTrove: timeTrove ?? { arOwnerAddress: '', balance: 0 },
    createTimeTrove: createTimeTrove,
    isValidating: isValidating,
  }
}

type TimeToken = {
  tokenId: number,
  tokenOwner: string,
}

export function useTimeToken(topicOwner: string, topicSlug?: string): {
  mintTimeToken: (() => void),
  mintedTimeTokens: TimeToken[],
} {
  const authToken = useRecoilValue(authTokenState)
  const ethereumSigner = useEthereumSigner()

  const [mintedTimeTokens, setMintedTimeTokens] = useState<TimeToken[]>([])

  /**
   *  list time token mint
   */
  const listTimeTokenMinted = useCallback(() => {
    const event = controllerContract.filters.TimeTokenMinted(topicOwner, topicSlug ?? null, null)
    controllerContract.queryFilter(event, 15537393).then(async (logs) => {
      const tokens = logs.map((log: any) => ({
        tokenId: +log.args.tokenId,
        tokenOwner: log.args.tokenOwner,
      }))
      setMintedTimeTokens(tokens)
    })
  }, [topicOwner, topicSlug, setMintedTimeTokens])

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
        .connect(ethereumSigner)
        .mintTimeToken(valueInWei, topicOwner, topicSlug, arId, signature, { value: valueInWei })
      await tx.wait()
    }).catch((err) => {
      console.log(err)
    })
  }, [authToken, ethereumSigner, topicOwner, topicSlug])

  return {
    mintTimeToken: mintTimeToken,
    mintedTimeTokens: mintedTimeTokens,
  }
}
