import { ethers } from 'ethers'

export type TimeTokenData = {
  valueInWei: ethers.BigNumberish,
  topicOwner: string,
  topicSlug: string,
  arId: string,
  status: number,
}

export type TimeTroveData = {
  arOwnerAddress: string,
  balance: ethers.BigNumberish,
}