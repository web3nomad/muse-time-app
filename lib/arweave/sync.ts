import { ethers } from 'ethers'
import getCurrency from 'bundlr-arseeding-client/build/web/currencies'
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder'
import { ResourceTypes } from './types'
import type { ArweaveDataTag } from './types'
import { publicProvider } from '@/lib/ethereum/public'

async function submitOrder(
  payload: {[_key:string]: unknown} | Array<{[_key:string]: unknown}>,
  tags: ArweaveDataTag[],
  authToken: string,
) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum)
  await provider._ready()
  const currencyConfig: any = getCurrency('ethereum', provider)
  // the default provider url is offline
  currencyConfig.providerUrl = publicProvider.connection.url
  await currencyConfig.ready()
  // {
  //   // window.currencyConfig = currencyConfig
  //   currencyConfig.w3signer = await currencyConfig.wallet.getSigner();
  //   currencyConfig._address = await (await provider.getSigner()).getAddress()
  //   currencyConfig.providerInstance = new ethers.providers.JsonRpcProvider(currencyConfig.providerUrl);
  //   console.log(currencyConfig)
  // }
  const signer = await currencyConfig.getSigner()
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
}: {
  resourceId: string,
  resourceType: ResourceTypes,
  resourceOwner: string,
  payload: {[_key:string]: unknown} | Array<{[_key:string]: unknown}>,
  authToken: string,
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
  const result = await submitOrder(payload, tags, authToken)
  return result
}
