import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder'
import { EIP_712_AUTH } from '@/lib/constants'

const makeError = (status: number, message: string) => {
  const error: Error & { status: number } = new Error(message) as any
  error.status = status
  return error
}

async function getVerifiedAddress(authHeader: string) {
  if (!/Token .+/i.test(authHeader)) {
    throw makeError(401, 'Not Authenticated')
  }
  const token = authHeader.substr(6)
  const payload : {
    value: {
      intent: string,
      wallet: string,
      expire: number,
    },
    signature: string
  } = JSON.parse(Buffer.from(token, 'base64').toString())
  if (payload.value.expire < new Date().valueOf()) {
    throw makeError(401, 'Token Expired')
  }
  const verifiedAddress = ethers.utils.verifyTypedData(
    EIP_712_AUTH.domain, EIP_712_AUTH.types, payload.value, payload.signature)
  if (verifiedAddress !== payload.value.wallet) {
    throw makeError(401, 'Invalid Token')
  }
  return ethers.utils.getAddress(verifiedAddress)
}

async function getDataOwner(itemId) {
  const res = await fetch(`https://arseed.web3infra.dev/bundle/tx/${itemId}`)
  const data = await res.json()
  const tag = data.tags.find((item) => item.name === 'Data-Owner')
  return ethers.utils.getAddress(tag?.value)
}

const handler = async function(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const order = req.body['order']
  const authHeader = req.headers['authorization'] ?? ''

  const owner = await getDataOwner(order.itemId)
  const verifiedAddress = await getVerifiedAddress(authHeader)
  // console.log(owner, verifiedAddress)
  if (verifiedAddress !== owner) {
    res.status(403).end()
    return
  }

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
