import { ethers } from 'ethers'
import base64url from 'base64url'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AuthTokenPayload, EIP_712_AUTH, requireAuth, NextApiRequestWithAuth } from '@/lib/auth'
import { publicProvider, controllerContract } from '@/lib/ethereum/public'
import { base64UrlToBytes32 } from '@/lib/utils'

export async function _signControllerParams(types: string[], fields: any[]) {
  // TODO: chainId must be included in signature !!!
  const privateKey = process.env.PARAMS_SIGNER_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('PARAMS_SIGNER_PRIVATE_KEY not set')
  }
  const paramsSigner = new ethers.Wallet(privateKey, publicProvider)
  const messageHash = ethers.utils.solidityKeccak256(types, fields)
  // 如果不 arrayify, signMessage 里面的 hashMessage 会把 '0x' 开头的 hash 也当成字符串先 toUtf8Bytes 一下
  const messageBytes = ethers.utils.arrayify(messageHash)
  const signature = await paramsSigner.signMessage(messageBytes)
  // const signerAddress = await ethers.utils.verifyMessage(messageBytes, signature);
  return signature
}

const handler = async function(req: NextApiRequestWithAuth, res: NextApiResponse) {
  const { auth, walletAddress } = req.user
  const topicOwner = walletAddress;
  const hash = ethers.utils._TypedDataEncoder.hash(EIP_712_AUTH.domain, EIP_712_AUTH.types, auth.value)
  const recoveredKey = ethers.utils.recoverPublicKey(ethers.utils.arrayify(hash), auth.signature)
  const publicKeyBuffer = Buffer.from(ethers.utils.arrayify(recoveredKey))
  const publicKeyHash = Buffer.from(ethers.utils.arrayify(ethers.utils.sha256(publicKeyBuffer)))
  const arOwnerAddressBase64Url = base64url.encode(publicKeyHash)
  const arOwnerAddress = base64UrlToBytes32(arOwnerAddressBase64Url)
  const signature = await _signControllerParams(
    ['address', 'address', 'bytes32'],
    [controllerContract.address, topicOwner, arOwnerAddress],
  )
  res.status(200).json({
    // user: req.user,
    arOwnerAddressBase64Url: arOwnerAddressBase64Url,
    arOwnerAddress: arOwnerAddress,
    topicOwner: topicOwner,
    signature: signature,
  })
}

export default requireAuth(handler)

/*
const promises = [
  ['0x00fcadfb3dd90d5482d30edb0d5f38aefb9bad25', 'qhZXh9eFN1SBHn8op6jxDwGih2NbK7dUuRy73Be738w'],
  ['0x7fff9ec0a88cef1f9d863e587ab5abaa9367c6ee', 'ITDqkBDN6oyzR7mhOa3CCTCjuS_u2JzGZHStK7wL900'],
  ['0x4a3e40b76a946495a6255b521240487e71f73d2c', 'oUkd3JZJKT5nDVLMeJeSCCPexEzlz9i3kK86a_yRi5E'],
].map(async ([topicOwner, arOwnerAddressBase64Url]) => {
  const arOwnerAddress = base64UrlToBytes32(arOwnerAddressBase64Url)
  const signature = await _signControllerParams(
    ['address', 'address', 'bytes32'],
    [controllerContract.address, topicOwner, arOwnerAddress],
  )
  return { topicOwner, arOwnerAddress, signature }
})
const results = await Promise.all(promises)
res.status(200).json(results)
*/
