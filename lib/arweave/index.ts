import { ethers } from 'ethers'
import { submitOrder } from './order'
import { ArweaveResourceType } from './types'
import type {
  EverpayTx,
  ArweaveDataPayload,
  ArweaveDataTag,
  TopicData,
  ProfileData,
} from './types'

export {
  EverpayTx,
  ArweaveDataPayload,
  ArweaveDataTag,
  TopicData,
  ProfileData,
  ArweaveResourceType,
}

export async function updateArweaveData({
  resourceId,
  resourceType,
  resourceOwner,
  payload,
  authToken,
}: {
  resourceId: string,
  resourceType: ArweaveResourceType,
  resourceOwner: string,
  payload: ArweaveDataPayload,
  authToken: string,
}) {
  const tags = [
    {name: 'Content-Type', value: 'application/json'},
    {name: 'App-Name', value: 'MuseTime'},
    {name: 'Resource-Id', value: resourceId},
    {name: 'Resource-Type', value: resourceType},
    {name: 'Resource-Owner', value: ethers.utils.getAddress(resourceOwner)},
  ]
  const result = await submitOrder(payload, tags, authToken)
  return result
}

const ARWEAVE_QUERY = `query Query($resourceId: String!, $resourceType: String!, $resourceOwner: String!) {
  transactions(
    first: 1,
    sort: HEIGHT_DESC,
    tags: [
      { name: "Resource-Id", values: [$resourceId] },
      { name: "Resource-Type", values: [$resourceType] },
      { name: "Resource-Owner", values: [$resourceOwner] }
    ]
  ) {
    edges {
      node {
        id
        tags { name value }
      }
    }
  }
}`

export async function getArweaveData({
  resourceId,
  resourceType,
  resourceOwner,
}: {
  resourceId: string,
  resourceType: ArweaveResourceType,
  resourceOwner: string,
}) {
  const node = await fetch('https://arseed.web3infra.dev/graphql', {
    method: 'POST',
    body: JSON.stringify({
      operationName: 'Query',
      query: ARWEAVE_QUERY,
      variables: {
        resourceId: resourceId,
        resourceType: resourceType,
        resourceOwner: ethers.utils.getAddress(resourceOwner),
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(async res => {
    const { data } = await res.json()
    const edges = data['transactions']['edges']
    return edges.length ? edges[0]['node'] : null
  }).catch(err => {
    console.log(err)
    return null
  })
  if (node) {
    // fetch data
    const itemId = node['id']
    const data = await fetch(`https://arseed.web3infra.dev/${itemId}`).then(res => res.json())
    return data
  } else {
    return null
  }
}
