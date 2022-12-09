import { ethers } from 'ethers'
import base64url from 'base64url'
import type { NextApiRequest, NextApiResponse } from 'next'
import { publicProvider, controllerContract } from '@/lib/ethereum/public'
import type { TimeTroveData } from '@/lib/ethereum/types'
import { queryOnChainItemId, ResourceTypes } from '@/lib/arweave'
import type { TopicData, ProfileData } from '@/lib/arweave'
import { base64UrlToBytes32, bytes32ToBase64Url } from '@/lib/utils'
import { _signControllerParams } from './createTimeTroveParams'

export type MintParamsResult = {
  expired: number
  valueInWei: string
  profileArId: string
  topicsArId: string
  topicId: string
  topicOwner: string
  signature: string
}

const findTopic = async (arOwnerAddress: string, topicOwner: string, topicId: string): Promise<{
  topicsArId: string,
  topic: TopicData|null,
}> => {
  const topicsArId = await queryOnChainItemId({
    arOwnerAddress: arOwnerAddress,
    resourceId: '',
    resourceType: ResourceTypes.TOPICS,
    resourceOwner: topicOwner,
  })
  // if (!topicsArId) {}
  const topics: TopicData[] = await fetch(`https://arseed.web3infra.dev/${topicsArId}`).then(res => res.json())
  const topic = topics.find(({ id }) => id === topicId) ?? null
  return { topicsArId, topic }
}

const findProfile = async (arOwnerAddress: string, topicOwner: string): Promise<{
  profileArId: string,
  profile: ProfileData|null,
}> => {
  const profileArId = await queryOnChainItemId({
    arOwnerAddress: arOwnerAddress,
    resourceId: '',
    resourceType: ResourceTypes.PROFILE,
    resourceOwner: topicOwner,
  })
  // const profile: ProfileData = await fetch(`https://arseed.web3infra.dev/${profileArId}`).then(res => res.json())
  return { profileArId, profile: null }
}

const handler = async function(req: NextApiRequest, res: NextApiResponse) {
  const { topicOwner, topicId, walletAddress } = req.body

  const timeTrove: TimeTroveData = await controllerContract.timeTroveOf(topicOwner)
  const arOwnerAddress = bytes32ToBase64Url(timeTrove.arOwnerAddress)

  const [
    { topicsArId, topic },
    { profileArId },
    blockNumber,
  ] = await Promise.all([
    findTopic(arOwnerAddress, topicOwner, topicId),
    findProfile(arOwnerAddress, topicOwner),
    publicProvider.getBlockNumber(),
  ])

  if (!topic) {
    res.status(400).json({ 'detail': 'invalid topic' })
    return
  }

  // const mintKey = ethers.BigNumber.from(Date.now())
  //   .mul(1000000).add(Math.floor(Math.random() * 1000))
  //   .toString()
  const expired = blockNumber + 10000  // ~ 1 day
  const [val, unit] = topic['value'].split(' ')
  const valueInWei = ethers.utils.parseUnits(val, unit).toString()
  // toString is necessary, _signControllerParams won't do this automatically

  const profileArIdBytes32 = base64UrlToBytes32(profileArId)
  const topicsArIdBytes32 = base64UrlToBytes32(topicsArId)
  const topicIdBytes32 = base64UrlToBytes32(topicId)

  const signature = await _signControllerParams(
    ['address', 'address', 'uint256',
      'uint256', 'bytes32', 'bytes32', 'bytes32', 'address'],
    [controllerContract.address, walletAddress, expired,
      valueInWei, profileArIdBytes32, topicsArIdBytes32, topicIdBytes32, topicOwner],
  )

  const result: MintParamsResult = {
    expired,
    valueInWei,
    profileArId: profileArIdBytes32,
    topicsArId: topicsArIdBytes32,
    topicId: topicIdBytes32,
    topicOwner,
    signature,
  }

  res.status(200).json(result)
}

export default handler
