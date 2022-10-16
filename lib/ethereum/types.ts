import { ethers } from 'ethers'

export type TimeTokenData = {
  topicOwner: string
  valueInWei: ethers.BigNumberish
  profileArId: string
  topicsArId: string
  topicId: string
  status: number
}

export type TimeTroveData = {
  arOwnerAddress: string
  balance: ethers.BigNumberish
}
