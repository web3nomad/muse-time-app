import useSWR from 'swr'
import { ethers } from 'ethers'
import { useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { authTokenState } from '@/lib/recoil/wallet'
import { useEthereumSigner, publicProvider, controllerContract } from '@/lib/ethereum/public'

export type TimeTrove = {
  addressAR: string,
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
      const { addressAR, signature } = (await res.json()) as { addressAR: string, signature: string }
      const tx = await controllerContract.connect(ethereumSigner).createTimeTrove(addressAR, signature)
      await tx.wait()
    }).catch((err) => {
      console.log(err)
    })
  }, [authToken, ethereumSigner])

  /**
   * get time trove
   */
  const fetcher = async (topicOwner: string) => {
    const [addressAR, balance] = await controllerContract.timeTroveOf(topicOwner)
    return { addressAR, balance } as TimeTrove
  }
  const {
    data: timeTrove,
    isValidating
  } = useSWR(topicOwner, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    timeTrove: timeTrove ?? { addressAR: '', balance: 0 },
    createTimeTrove: createTimeTrove,
    isValidating: isValidating,
  }
}
