import { ethers } from 'ethers'
import getCurrency from 'bundlr-arseeding-client/build/web/currencies'
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder'
import { ResourceTypes } from './types'
import type { ArweaveDataTag } from './types'
import { publicProvider } from '@/lib/ethereum/public'
import { AuthTokenPayload, EIP_712_AUTH } from '@/lib/auth'

async function submitOrder(
  payload: {[_key:string]: unknown} | Array<{[_key:string]: unknown}>,
  tags: ArweaveDataTag[],
  authToken: string,
  web3Signer: ethers.Signer,
) {
  const { value, signature }: AuthTokenPayload = JSON.parse(atob(authToken??''))
  const currencyConfig: any = getCurrency('ethereum', web3Signer.provider)
  // the default provider url is offline
  currencyConfig.providerUrl = publicProvider.connection.url
  const signer = await currencyConfig.getSigner()
  {
    /**
     * See
     * https://github.com/Bundlr-Network/arbundles/blob/a116829c1392aabeacda24c2e451226b15173a45/src/signing/chains/injectedEthereumSigner.ts
     * https://github.com/Bundlr-Network/js-sdk/blob/2e9782c967738aac3de60b31a8ba61469ab2eb99/src/web/currencies/ethereum.ts#L101
     */
    signer.setPublicKey = function() {
      const hash = ethers.utils._TypedDataEncoder.hash(EIP_712_AUTH.domain, EIP_712_AUTH.types, value)
      const recoveredKey = ethers.utils.recoverPublicKey(ethers.utils.arrayify(hash), signature)
      const publicKeyBuffer: Buffer = Buffer.from(ethers.utils.arrayify(recoveredKey))
      // this.publicKey = publicKeyBuffer
      signer.publicKey = publicKeyBuffer
    }.bind(signer)
  }
  await currencyConfig.ready()
  const arseedUrl = 'https://arseed.web3infra.dev'
  const dataRaw = Buffer.from(JSON.stringify(payload))
  const currency = 'AR'
  const options = { tags }
  const config = {
    signer: signer,
    arseedUrl: arseedUrl,
    currency: currency,
  }
  const order = await createAndSubmitItem(dataRaw, options, config)
  // pay for order
  const result: {
    hash: string,
    itemId: string,
  } = await fetch('/api/arweave/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${authToken}`,
    },
    body: JSON.stringify({ order })
  }).then(res => res.json())
  return result
}

export async function syncArweaveData({
  resourceId,
  resourceType,
  resourceOwner,
  payload,
  authToken,
  web3Signer,
}: {
  resourceId: string,
  resourceType: ResourceTypes,
  resourceOwner: string,
  payload: {[_key:string]: unknown} | Array<{[_key:string]: unknown}>,
  authToken: string,
  web3Signer: ethers.Signer,
}) {
  const tags = [
    {name: 'Content-Type', value: 'application/json'},
    {name: 'App-Name', value: 'MuseTime'},
    {name: 'Resource-Id', value: resourceId},
    {name: 'Resource-Type', value: resourceType},
    {name: 'Resource-Owner', value: ethers.utils.getAddress(resourceOwner)},
    {name: 'Resource-Timestamp', value: Date.now().toString()},
    /* add Resource-Timestamp, so that every item is always diffrent from previous ones,
    for example, after removing a topic (4 topics -> 3 topics), the topics list data may be same with a
    previous list if no topic is edited, the same ItemId(tx) will be generated (by Web3Infra in ANS-104 bundle).
    As a result, the 3-topics data's block is always lower than 4-topics data's block. */
  ]
  const result = await submitOrder(payload, tags, authToken, web3Signer)
  return result
}
