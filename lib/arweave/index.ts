import { ethers } from 'ethers'
import { submitOrder } from './order'
export { ArweaveResourceType } from './types'
export type {
  EverpayTx,
  ArweaveDataPayload,
  ArweaveDataTag,
  TopicData,
  ProfileData,
} from './types'

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
  walletAddress: string,
  authToken: string,
}) {
  const tags = [
    {name: 'Content-Type', value: 'application/json'},
    {name: 'App-Name', value: 'MuseTime'},
    {name: 'Resource-Id', value: resourceId},
    {name: 'Resource-Type', value: resourceType},
    {name: 'Resource-Owner', value: ethers.utils.getAddress(walletAddress)},
  ]
  const result = await submitOrder(payload, tags, authToken)
  return result
}
