import { ethers } from 'ethers'
import base64url from 'base64url'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AuthTokenPayload, EIP_712_AUTH, requireAuth, NextApiRequestWithAuth } from '@/lib/auth'
import { publicProvider, controllerContract } from '@/lib/ethereum/public'
import type { TimeTrove } from '@/lib/ethereum/types'
import { queryOnChainItemId, ArweaveResourceType } from '@/lib/arweave'
import type { TopicData } from '@/lib/arweave'
import { _signControllerParams } from './createTimeTroveParams'

const findTopic = async (topicOwner: string, topicSlug: string): Promise<{
  arId: string,
  topic: TopicData|null,
}> => {
  const timeTrove: TimeTrove = await controllerContract.timeTroveOf(topicOwner)
  const { arOwnerAddress } = timeTrove
  const arId = await queryOnChainItemId({
    arOwnerAddress: arOwnerAddress,
    resourceId: '',
    resourceType: ArweaveResourceType.TOPICS,
    resourceOwner: topicOwner,
  })
  // if (!arId) {}
  const topicsList: TopicData[] = await fetch(`https://arseed.web3infra.dev/${arId}`).then(res => res.json())
  const topic = topicsList.find(({ id }) => id === topicSlug) ?? null
  return { arId, topic }
}

const handler = async function(req: NextApiRequestWithAuth, res: NextApiResponse) {
  const { walletAddress } = req.user
  const { topicOwner, topicSlug } = req.body

  const { arId, topic } = await findTopic(topicOwner, topicSlug)
  if (!topic) {
    res.status(400).json({ 'detail': 'invalid topic' })
    return
  }

  const [val, unit] = topic['value'].split(' ')
  const valueInWei = ethers.utils.parseUnits(val, unit).toString()
  // toString is necessary, _signControllerParams won't do this automatically

  const signature = await _signControllerParams(
    ['address', 'uint256', 'address', 'string', 'string', 'address'],
    [walletAddress, valueInWei, topicOwner, topicSlug, arId, controllerContract.address],
  )

  res.status(200).json({
    valueInWei,
    topicOwner,
    topicSlug,
    arId,
    signature,
  })
}

export default requireAuth(handler)
