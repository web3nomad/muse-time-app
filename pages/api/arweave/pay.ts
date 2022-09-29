import type { NextApiRequest, NextApiResponse } from 'next'
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder'

const handler = async function(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { order } = req.body
  const keyfileData = JSON.parse(process.env.ARWEAVE_KEYFILE)
  const keyfileAddress = process.env.KEY_FILE_ADDRESS
  const pay = newEverpayByRSA(keyfileData, keyfileAddress)
  const everHash = await payOrder(pay, order)
  res.status(200).json({
    hash: everHash,
    itemId: order.itemId,
  })
}

export default handler
