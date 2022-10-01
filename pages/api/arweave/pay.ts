import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder'
import { requireAuth, NextApiRequestWithAuth } from '@/lib/auth'
import type { ArweaveDataTag } from '@/lib/arweave'

const KEY_FILE_DATA = JSON.parse(process.env.ARWEAVE_KEYFILE!)
const KEY_FILE_ADDRESS = process.env.KEY_FILE_ADDRESS as string

async function getResourceOwner(itemId: string): Promise<string|null> {
  const data = await fetch(`https://arseed.web3infra.dev/bundle/tx/${itemId}`).then(res=>res.json())
  const tag = data.tags.find((item: ArweaveDataTag) => item.name === 'Resource-Owner')
  return tag ? ethers.utils.getAddress(tag.value) : null
}

const handler = async function(
  req: NextApiRequestWithAuth,
  res: NextApiResponse
) {
  const order = req.body['order']
  const resourceOwner = await getResourceOwner(order.itemId)
  // console.log(resourceOwner, req.user.walletAddress)
  if (!resourceOwner || req.user.walletAddress !== resourceOwner) {
    res.status(403).end()
    return
  }
  const pay = newEverpayByRSA(KEY_FILE_DATA, KEY_FILE_ADDRESS)
  const everHash = await payOrder(pay, order)
  res.status(200).json({
    hash: everHash,
    itemId: order.itemId,
  })
}

export default requireAuth(handler)
