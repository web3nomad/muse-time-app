import { ethers } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'

export const EIP_712_AUTH = {
  types: {
    Auth: [
        { name: 'intent', type: 'string' },
        { name: 'wallet', type: 'address' },
        { name: 'expire', type: 'uint256' },
    ]
  },
  domain: {}
}

export type SignatureMessageData = {
  intent: string,
  wallet: string,
  expire: number,
}

export type AuthTokenPayload = {
  value: SignatureMessageData,
  signature: string
}

type User = {
  walletAddress: string
  auth: AuthTokenPayload
}

export type NextApiRequestWithAuth = NextApiRequest & {
  user: User
}

async function authenticate(req: NextApiRequest): Promise<User> {
  const makeError = (status: number, message: string) => {
    const error: Error & { status: number } = new Error(message) as any
    error.status = status
    return error
  }
  const authHeader: string = req.headers['authorization'] || ''
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
    EIP_712_AUTH.domain, EIP_712_AUTH.types, payload.value, payload.signature
  )
  const walletAddress = ethers.utils.getAddress(verifiedAddress)
  const addressInToken = ethers.utils.getAddress(payload.value.wallet)
  if (walletAddress !== addressInToken) {
    throw makeError(401, 'Invalid Token')
  }
  return {
    walletAddress,
    auth: payload,
  }
}

export function requireAuth(handler: (req: NextApiRequestWithAuth, res: NextApiResponse) => void) {
  return async function(req: NextApiRequest, res: NextApiResponse) {
    const reqWithAuth: NextApiRequestWithAuth = req as any
    try {
      reqWithAuth.user = await authenticate(req)
    } catch(error: any) {
      console.log(error)
      const status = error.status || 500
      const message = error.message || 'Server Error'
      res.status(status).json({ 'detail': message })
      return
    }
    return handler(reqWithAuth, res)
  }
}
