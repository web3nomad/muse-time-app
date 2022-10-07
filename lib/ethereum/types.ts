import { ethers } from 'ethers'

export type TimeToken = {
  valueInWei: ethers.BigNumberish,
  topicOwner: string,
  topicSlug: string,
  arId: string,
  status: number,
}

export type TimeTrove = {
  arOwnerAddress: string,
  balance: ethers.BigNumberish,
}
