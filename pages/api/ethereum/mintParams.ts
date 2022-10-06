import { ethers } from 'ethers'
import base64url from 'base64url'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AuthTokenPayload, EIP_712_AUTH, requireAuth, NextApiRequestWithAuth } from '@/lib/auth'
import { publicProvider, controllerContract } from '@/lib/ethereum/public'
import { _signControllerParams } from './createTimeTroveParams'

const handler = async function(req: NextApiRequestWithAuth, res: NextApiResponse) {
  const { auth, walletAddress } = req.user
  const { resourceOwner, topicId } = req.body
  // 要先获取 arOwnerAddress, 通过 resourceOwner

  const valueInWei = ethers.utils.parseUnits('1', 'ether')
  const topicOwner = '0x0000000000000000000000000000000000000000'
  const topicSlug = '/x/y'
  const signature = await _signControllerParams(
    ['address', 'uint256', 'address', 'string', 'address'],
    [walletAddress, valueInWei, topicOwner, topicSlug, controllerContract.address],
  )
  res.status(200).json({
    signature: signature,
  })
}

export default requireAuth(handler)
