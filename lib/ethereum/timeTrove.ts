import { ethers } from 'ethers'
import useSWR from 'swr'

export type TimeTrove = {
  addressAR: string,
  balance: ethers.BigNumberish
}

export function useTimeTrove(topicOwner: string) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
  const controller = new ethers.Contract(process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS, [
    'function timeTroveOf(address topicOwner) view returns (tuple(string, uint256))'
  ], provider)
  const fetcher = async (topicOwner) => {
    const [addressAR, balance] = await controller.timeTroveOf(topicOwner)
    return { addressAR, balance }
  }
  const { data, isValidating } = useSWR(topicOwner, fetcher)
  return data
}
