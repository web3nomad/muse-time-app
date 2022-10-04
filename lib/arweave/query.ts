import { ethers } from 'ethers'
import { ArweaveResourceType } from './types'
import type { EverpayTx, ArweaveMetadata } from './types'

type QueryParams = {
  arOwnerAddress: string,  // arweave owner address
  resourceId: string,
  resourceType: ArweaveResourceType,
  resourceOwner: string,  // ethereum address
}

async function queryPendingItemId({
  resourceId,
  resourceType,
  resourceOwner,
}: Omit<QueryParams, 'arOwnerAddress'>) {
  const url = `https://arseed.web3infra.dev/bundle/orders/${resourceOwner}`
  const txs: EverpayTx[] = await fetch(url).then(async (res) => {
    const txs: EverpayTx[] = await res.json()
    // return txs.filter((tx) => tx.paymentStatus === 'paid')
    return txs.filter((tx) => tx.paymentStatus === 'paid' && tx.onChainStatus !== 'success')
  }).catch((err) => {
    console.log(err)
    return []
  })
  const promises: Promise<ArweaveMetadata>[] = txs.map(async (tx) => {
    const url = `https://arseed.web3infra.dev/bundle/tx/${tx.itemId}`
    return fetch(url).then(res => res.json())
  })
  const metadataList = await Promise.all(promises)
  const filteredMetadataList = metadataList.filter(({ tags }) => {
    const tagsMap: {[_key:string]:string} = {}
    tags.forEach((tag) => tagsMap[tag.name] = tag.value)
    return (
      tagsMap['Resource-Id'] == resourceId &&
      tagsMap['Resource-Type'] == resourceType &&
      tagsMap['Resource-Owner'] == resourceOwner
    )
  })
  if (filteredMetadataList.length) {
    return filteredMetadataList[0]['id']
  } else {
    return null
  }
}

const ARWEAVE_QUERY = `query Query(
  $arOwnerAddress: String!,
  $resourceId: String!,
  $resourceType: String!,
  $resourceOwner: String!
) {
  transactions(
    first: 1,
    sort: HEIGHT_DESC,
    owners: [$arOwnerAddress]
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

async function queryOnChainItemId({
  arOwnerAddress,
  resourceId,
  resourceType,
  resourceOwner,
}: QueryParams) {
  const node = await fetch('https://arseed.web3infra.dev/graphql', {
    method: 'POST',
    body: JSON.stringify({
      operationName: 'Query',
      query: ARWEAVE_QUERY,
      variables: {
        arOwnerAddress: arOwnerAddress,
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
    return node['id']
  } else {
    return null
  }
}

export async function getArweaveData({
  arOwnerAddress,
  resourceId,
  resourceType,
  resourceOwner,
}: QueryParams) {
  const [pendingItemId, onChainItemId] = await Promise.all([
    queryPendingItemId({ resourceId, resourceType, resourceOwner }),
    queryOnChainItemId({ arOwnerAddress, resourceId, resourceType, resourceOwner }),
  ])
  const itemId = pendingItemId || onChainItemId || null
  // console.log(itemId, pendingItemId, onChainItemId)
  if (itemId) {
    const data = await fetch(`https://arseed.web3infra.dev/${itemId}`).then(res => res.json())
    return data
  } else {
    return null
  }
}
