// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type { TopicData } from '@/lib/arweave'
import { getChecksumAddress } from '@/lib/ethereum'

const query = `query TopicQuery($address: String!, $uuid: String!) {
  transactions(
    first: 1,
    sort: HEIGHT_DESC,
    tags: [
      { name: "Resource-Type", values: ["profile"] },
      { name: "Resource-Id", values: ["$uuid"] },
      { name: "Resource-Owner", values: [$address] }
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TopicData>,
) {
  const address = getChecksumAddress(req.query.address as string)
  const uuid = req.query.uuid as string
  // query last record
  const node = await fetch('https://arseed.web3infra.dev/graphql', {
    method: 'POST',
    body: JSON.stringify({
      operationName: 'TopicQuery',
      query: query,
      variables: { address, uuid }
    }),
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(async res => {
    const { data } = await res.json()
    return data['transactions']['edges'][0]
  }).catch(err => {
    console.log(err)
    return null
  })
  const topic: TopicData = {
    name: '',
    description: '',
    category: '',
    value: '',
    duration: '',
  }
  if (node) {
    // fetch data
    const itemId = node['node']['id']
    const data = await fetch(`https://arseed.web3infra.dev/${itemId}`).then(res => res.json())
    Object.assign(topic, data)
  }
  res.status(200).json(topic)

  // TODO: throw 404 is resource id doesn't exist !!!

}
