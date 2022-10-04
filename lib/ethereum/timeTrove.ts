import useSWR from 'swr'
import { ethers } from 'ethers'
import { useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { authTokenState } from '@/lib/recoil/wallet'

export type TimeTrove = {
  addressAR: string,
  balance: ethers.BigNumberish
}

// const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
const controller = new ethers.Contract(process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS!, [
  'function timeTroveOf(address topicOwner) view returns (tuple(string, uint256))',
  'function initTimeTrove(string addressAR, bytes signature)'
], new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!))

export function useTimeTrove(topicOwner: string): [TimeTrove, (() => void)] {
  const authToken = useRecoilValue(authTokenState)

  /**
   * create time trove
   */
  const createTimeTrove = useCallback(() => {
    fetch('/api/ethereum/initTimeTroveParams', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
      },
    }).then(async (res) => {
      const { addressAR, signature } = (await res.json()) as { addressAR: string, signature: string }
      // TODO 优化这一段
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const signer = await provider.getSigner()
      const tx = await controller.connect(signer).initTimeTrove(addressAR, signature)
      await tx.wait()
    }).catch((err) => {
      console.log(err)
    })
  }, [authToken])

  /**
   * get time trove
   */
  const fetcher = async (topicOwner: string) => {
    const [addressAR, balance] = await controller.timeTroveOf(topicOwner)
    return { addressAR, balance } as TimeTrove
  }
  const {
    data: timeTrove,
    isValidating
  } = useSWR(topicOwner, fetcher)

  return [
    timeTrove ?? { addressAR: '', balance: 0 },
    createTimeTrove
  ]
}
