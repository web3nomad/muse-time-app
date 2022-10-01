import { ethers } from 'ethers'
import getCurrency from 'bundlr-arseeding-client/build/web/currencies'
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder'
import type { ChecksumAddress } from '@/lib/ethereum'

export type EverpayTx = {
  'id': number,
  'paymentStatus': string,
  'paymentId': string,
  'onChainStatus': string
}
export type ArweaveDataPayload = {[_key:string]: unknown}
export type ArweaveDataTag = {name:string,value:string}

export enum ArweaveResourceType {
  PROFILE = 'profile',
  TOPIC = 'topic',
}

export type TopicData = {
  name: string,
  description: string,
  category: string,
  value: string,
  duration: string,
}

export type ProfileData = {
  name: string,
  bio: string,
}

async function submitOrder({ tags, payload }: {
  tags: ArweaveDataTag[],
  payload: ArweaveDataPayload,
}) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum)
  await provider._ready()
  const currencyConfig = getCurrency('ethereum', provider)
  await currencyConfig.ready()
  const signer = await currencyConfig.getSigner()
  const arseedUrl = 'https://arseed.web3infra.dev'
  const dataRaw = Buffer.from(JSON.stringify(payload))
  const currency = 'AR'
  const options = {
    tags: [
      {name: 'Content-Type', value: 'application/json'},
      {name: 'App-Name', value: 'MuseTime'},
      ...tags,
    ]
  }
  const config = {
    signer: signer,
    arseedUrl: arseedUrl,
    currency: currency,
  }
  const order = await createAndSubmitItem(dataRaw, options, config)
  return order
}

export async function updateArweaveData({
  resourceId,
  resourceType,
  payload,
  walletAddress,
  authToken,
}: {
  resourceId: string,
  resourceType: ArweaveResourceType,
  payload: ArweaveDataPayload,
  walletAddress: ChecksumAddress,
  authToken: string,
}) {
  const tags = [
    {name: 'Resource-ID', value: resourceId},
    {name: 'Resource-Type', value: resourceType},
    {name: 'Resource-Owner', value: walletAddress.toString()},
  ]
  const order = await submitOrder({ tags, payload })
  const res = await fetch('/api/arweave/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${authToken}`,
    },
    body: JSON.stringify({
      order: order
    })
  })
  const result = await res.json()
  return result
}
