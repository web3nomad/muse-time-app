import { ethers } from 'ethers'
import base64url from 'base64url'
import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { walletAddressState, authTokenState } from '@/lib/recoil/wallet'
import { AuthTokenPayload, EIP_712_AUTH } from '@/lib/auth'


/**
 * not usefull for the moment
 * const [ownerKey, ownerAddress] = useArOwner()
 */
export function useArOwner(): [string?, string?] {
  function getValueFromAuthToken(authToken: string|null): AuthTokenPayload {
    try {
      const { value, signature }: AuthTokenPayload = JSON.parse(atob(authToken??''))
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
