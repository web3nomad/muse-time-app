import { ethers } from 'ethers'

export const chainId = +(process.env.NEXT_PUBLIC_CHAIN_ID ?? '31337')

const _publicRpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? 'http://localhost:8545'
export const publicProvider = new ethers.providers.JsonRpcProvider(_publicRpcUrl)

const _controllerAddress = process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS ?? '0x0000000000000000000000000000000000000000'
export const controllerContract = new ethers.Contract(_controllerAddress, [
  'function tokenURI(uint256 tokenId) view returns (string)',
  /**
   * struct TimeToken {
   *     uint256 valueInWei;
   *     address topicOwner;
   *     string topicSlug;
   *     string arId;
   *     TimeTokenStatus status;
   * }
   */
  'function timeTokenOf(uint256 tokenId) view returns (tuple(uint256, address, string, string, uint256))',
  /**
   * struct TimeTrove {
   *     string arOwnerAddress;
   *     uint256 balance;
   * }
   */
  'function timeTroveOf(address topicOwner) view returns (tuple(string, uint256))',
  'function mintTimeToken(uint256 valueInWei, address topicOwner, string topicSlug, string arId, bytes signature) payable',
  'function createTimeTrove(string arOwnerAddress, bytes signature)'
], publicProvider)
