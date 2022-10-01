import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder'
import { requireAuth, NextApiRequestWithAuth } from '@/lib/auth'
import type { ArweaveDataTag } from '@/lib/arweave'
import { getChecksumAddress } from '@/lib/ethereum'
import type { ChecksumAddress } from '@/lib/ethereum'

const KEY_FILE_DATA = JSON.parse(process.env.ARWEAVE_KEYFILE!)
const KEY_FILE_ADDRESS = process.env.KEY_FILE_ADDRESS as string

async function getDataOwner(itemId: string): Promise<ChecksumAddress|null> {
  const res = await fetch(`https://arseed.web3infra.dev/bundle/tx/${itemId}`)
  const data = await res.json()
  const tag = data.tags.find((item: ArweaveDataTag) => item.name === 'Resource-Owner')
  return tag ? getChecksumAddress(tag.value) : null
}

const handler = async function(
  req: NextApiRequestWithAuth,
  res: NextApiResponse
) {
  const order = req.body['order']
  const ownerAddress = await getDataOwner(order.itemId)
  // console.log(ownerAddress, req.user.walletAddress)
  if (!ownerAddress || req.user.walletAddress.toString() !== ownerAddress.toString()) {
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
