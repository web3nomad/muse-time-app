import { ethers } from 'ethers'
import base64url from 'base64url'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AuthTokenPayload, EIP_712_AUTH, requireAuth, NextApiRequestWithAuth } from '@/lib/auth'
import { publicProvider, controllerContract } from '@/lib/ethereum/public'
import type { TimeTroveData } from '@/lib/ethereum/types'
import { queryOnChainItemId, ResourceTypes } from '@/lib/arweave'
import type { TopicData, ProfileData } from '@/lib/arweave'
import { _signControllerParams } from './createTimeTroveParams'

export type MintParamsResult = {
  mintKey: string
  valueInWei: string
  topicOwner: string
  topicSlug: string
  profileArId: string
  topicsArId: string
  signature: string
}

const findTopic = async (arOwnerAddress: string, topicOwner: string, topicSlug: string): Promise<{
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
  const topicsList: TopicData[] = await fetch(`https://arseed.web3infra.dev/${topicsArId}`).then(res => res.json())
  const topic = topicsList.find(({ id }) => id === topicSlug) ?? null
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

const handler = async function(req: NextApiRequestWithAuth, res: NextApiResponse) {
  const { walletAddress } = req.user
  const { topicOwner, topicSlug } = req.body

  const timeTrove: TimeTroveData = await controllerContract.timeTroveOf(topicOwner)
  const { arOwnerAddress } = timeTrove

  const [
    { topicsArId, topic },
    { profileArId },
  ] = await Promise.all([
    findTopic(arOwnerAddress, topicOwner, topicSlug),
    findProfile(arOwnerAddress, topicOwner),
  ])

  if (!topic) {
    res.status(400).json({ 'detail': 'invalid topic' })
    return
  }

  const mintKey = ethers.BigNumber.from(Date.now())
    .mul(1000000).add(Math.floor(Math.random() * 1000))
    .toString()
  const [val, unit] = topic['value'].split(' ')
  const valueInWei = ethers.utils.parseUnits(val, unit).toString()
  // toString is necessary, _signControllerParams won't do this automatically

  const signature = await _signControllerParams(
    ['address', 'uint256', 'uint256', 'address', 'string', 'string', 'string', 'address'],
    [walletAddress, mintKey, valueInWei, topicOwner, topicSlug, profileArId, topicsArId, controllerContract.address],
  )

  const result: MintParamsResult = {
    mintKey,
    valueInWei,
    topicOwner,
    topicSlug,
    profileArId,
    topicsArId,
    signature,
  }

  res.status(200).json(result)
}

export default requireAuth(handler)
