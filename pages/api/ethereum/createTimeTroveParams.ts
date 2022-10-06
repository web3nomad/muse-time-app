import { ethers } from 'ethers'
import base64url from 'base64url'
import type { NextApiRequest, NextApiResponse } from 'next'
import { AuthTokenPayload, EIP_712_AUTH, requireAuth, NextApiRequestWithAuth } from '@/lib/auth'
import { publicProvider, controllerContract } from '@/lib/ethereum/public'

export async function _signControllerParams(types: string[], fields: any[]) {
  const privateKey = process.env.VERIFICATION_ADDRESS_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('VERIFICATION_ADDRESS_PRIVATE_KEY not set')
  }
  const adminSigner = new ethers.Wallet(privateKey, publicProvider)
  const messageHash = ethers.utils.solidityKeccak256(types, fields)
  // 如果不 arrayify, signMessage 里面的 hashMessage 会把 '0x' 开头的 hash 也当成字符串先 toUtf8Bytes 一下
  const messageBytes = ethers.utils.arrayify(messageHash)
  const signature = await adminSigner.signMessage(messageBytes)
  // const signerAddress = await ethers.utils.verifyMessage(messageBytes, signature);
  return signature
}

const handler = async function(req: NextApiRequestWithAuth, res: NextApiResponse) {
  const { auth, walletAddress } = req.user
  const hash = ethers.utils._TypedDataEncoder.hash(EIP_712_AUTH.domain, EIP_712_AUTH.types, auth.value)
  const recoveredKey = ethers.utils.recoverPublicKey(ethers.utils.arrayify(hash), auth.signature)
  const publicKeyBuffer = Buffer.from(ethers.utils.arrayify(recoveredKey))
  const publicKeyHash = Buffer.from(ethers.utils.arrayify(ethers.utils.sha256(publicKeyBuffer)))
  const addressAR = base64url.encode(publicKeyHash)
  const signature = await _signControllerParams(
    ['address', 'string', 'address'],
    [walletAddress, addressAR, controllerContract.address],
  )
  res.status(200).json({
    // user: req.user,
    addressAR: addressAR,
    signature: signature,
  })
}

export default requireAuth(handler)