import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder'
import { requireAuth, NextApiRequestWithAuth } from '@/lib/auth'

const KEY_FILE_DATA = JSON.parse(process.env.ARWEAVE_KEYFILE)
const KEY_FILE_ADDRESS = process.env.KEY_FILE_ADDRESS

async function getDataOwner(itemId) {
  const res = await fetch(`https://arseed.web3infra.dev/bundle/tx/${itemId}`)
  const data = await res.json()
  const tag = data.tags.find((item) => item.name === 'Data-Owner')
  return ethers.utils.getAddress(tag?.value)
}

const handler = async function(
  req: NextApiRequestWithAuth,
  res: NextApiResponse
) {
  const order = req.body['order']
  const owner = await getDataOwner(order.itemId)
  // console.log(owner, req.user.walletAddress)
  if (req.user.walletAddress !== owner) {
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
