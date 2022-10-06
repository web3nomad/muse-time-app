import { ethers } from 'ethers'

export const chainId = +(process.env.NEXT_PUBLIC_CHAIN_ID ?? '31337')

const _publicRpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? 'http://localhost:8545'
export const publicProvider = new ethers.providers.JsonRpcProvider(_publicRpcUrl)

const _controllerAddress = process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS ?? '0x0000000000000000000000000000000000000000'
export const controllerContract = new ethers.Contract(_controllerAddress, [
  'function timeTroveOf(address topicOwner) view returns (tuple(string, uint256))',
  'function createTimeTrove(string addressAR, bytes signature)'
], publicProvider)

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
