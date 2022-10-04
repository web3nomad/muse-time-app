import { ethers } from 'ethers'
import base64url from 'base64url'
import { useRecoilValue } from 'recoil'
import { walletAddressState, authTokenState } from '@/lib/recoil/wallet'
import { useMemo } from 'react'
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

type User = {
  walletAddress: string
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
  return { walletAddress }
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

export function useArOwner(): [string?, string?] {
  function getValueFromAuthToken(authToken: string|null): {
    value?: Record<string,string>, signature?: string
  } {
    try {
      const { value, signature } = JSON.parse(atob(authToken??''))
      return { value, signature }
    } catch(err) {
      return {}
    }
  }

  const authToken = useRecoilValue(authTokenState)

  const [ownerKey, ownerAddress] = useMemo(() => {
    const { value, signature } = getValueFromAuthToken(authToken)
    if (!value || !signature) {
      return []
    }
    /**
     * - get Ethereum publicKey
     * https://github.com/Bundlr-Network/arbundles/blob/a116829c1392aabeacda24c2e451226b15173a45/src/signing/chains/injectedEthereumSigner.ts#L21
     * - ownerKey if base64url encoded of publicKey
     * https://github.com/Bundlr-Network/arbundles/blob/a116829c1392aabeacda24c2e451226b15173a45/src/signing/chains/ArweaveSigner.ts#L15
     */
    const hash = ethers.utils._TypedDataEncoder.hash(EIP_712_AUTH.domain, EIP_712_AUTH.types, value)
    const recoveredKey = ethers.utils.recoverPublicKey(ethers.utils.arrayify(hash), signature)
    const publicKeyBuffer = Buffer.from(ethers.utils.arrayify(recoveredKey))
    // const ownerKeyBuffer = base64url.toBuffer(publicKeyBuffer)
    const ownerKey = base64url.encode(publicKeyBuffer)
    /**
     * - ownerToAddress (calculated from publicKey)
     * https://github.com/ArweaveTeam/arweave-js/blob/58757d42b168197b96fccf2e56ad148a8a4764f5/src/common/wallets.ts#L88
     */
    const publicKeyHash = Buffer.from(ethers.utils.arrayify(ethers.utils.sha256(publicKeyBuffer)))
    const ownerAddress = base64url.encode(publicKeyHash)
    return [ownerKey, ownerAddress]
  }, [authToken])

  return [ownerKey, ownerAddress]
}
