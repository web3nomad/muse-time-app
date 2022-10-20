import { ethers } from 'ethers'

export type TimeTokenData = {
  valueInWei: ethers.BigNumberish
  profileArId: string
  topicsArId: string
  topicId: string
  topicOwner: string
  status: number
}

export type TimeTroveData = {
  arOwnerAddress: string
  balance: ethers.BigNumberish
}
