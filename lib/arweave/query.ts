import { ethers } from 'ethers'
import { ArweaveResourceType } from './types'

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
