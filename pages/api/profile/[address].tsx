// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { ProfileData } from '@/lib/arweave'

const query = `query ProfileQuery($address: String!) {
  transactions(
    first: 1,
    sort: HEIGHT_DESC,
    tags: [
      { name: "Resource-Type", values: ["profile"] },
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
  res: NextApiResponse<ProfileData>,
) {
  const address = ethers.utils.getAddress(req.query.address as string)
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
  const profile: ProfileData = {
    name: '',
    bio: '',
  }
  if (node) {
    // fetch data
    const itemId = node['node']['id']
    const data = await fetch(`https://arseed.web3infra.dev/${itemId}`).then(res => res.json())
    Object.assign(profile, data)
  }
  res.status(200).json(profile)
}
