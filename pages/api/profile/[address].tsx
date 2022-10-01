// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

const query = `query ProfileQuery($address: String!) {
  transactions(
    tags: [
      {
        name: "Data-Owner",
        values: [$address]
      },
      {
        name: "Data-Type",
        values: ["profile"]
      }
    ]
  ) {
    edges {
      node {
        id
        recipient
        tags {
          name
          value
        }
        owner {
          address
          key
        }
      }
    }
  }
}`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = req.query.address as string
  // query last record
  const node = await fetch('https://arseed.web3infra.dev/graphql', {
    method: 'POST',
    body: JSON.stringify({
      operationName: 'ProfileQuery',
      query: query,
      variables: { address }
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
  if (!node) {
    res.status(404).end()
    return
  }
  // fetch data
  const itemId = node['node']['id']
  const data = await fetch(`https://arseed.web3infra.dev/${itemId}`).then(res => res.json())
  res.status(200).json(data)
}
