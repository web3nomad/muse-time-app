import { ethers } from 'ethers'

export type TimeTokenData = {
  valueInWei: ethers.BigNumberish
  topicOwner: string
  status: number
}

export type TimeTroveData = {
  arOwnerAddress: string
  balance: ethers.BigNumberish
}

export type TimeTokenMintedLog = {
  topicOwner: string
  profileArId: string
  topicsArId: string
  topicId: string
  tokenId: number
  tokenOwner: string
}
