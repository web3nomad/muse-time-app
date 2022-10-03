// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type { TopicData } from '@/lib/arweave'

type AttributeData = {
  trait_type: string,
  value: string
}

type TimeMetadata = {
  name: string,
  description: string,
  image: string,
  external_url: string,
  attributes: AttributeData[],
}

async function findTopic(topicId: string, itemId: string): Promise<TopicData|null> {
  const url = `https://arseed.web3infra.dev/${itemId}`
  try {
    const topics: TopicData[] = await fetch(url).then(res => res.json())
    const topic = topics.find(({ id }) => id === topicId)
    return topic ?? null
  } catch(err) {
    console.log(err)
    return null
  }
}

const handler = async function(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query.params as string[]
  if (params.length !== 3) {
    res.status(404).end()
    return
  }
  const [tokenId, topicId, itemId] = params
  const topic = await findTopic(topicId, itemId)
  if (!topic) {
    res.status(404).end()
    return
  }
  const attributes = [
    { trait_type: 'category', value: topic['category'] },
    { trait_type: 'value', value: topic['value'] },
    { trait_type: 'duration', value: topic['duration'] },
    { trait_type: 'method', value: topic['method'] },
  ]
  const metadata = {
    name: topic.name,
    description: topic.description,
    image: '',
    external_url: '',
    attributes: attributes
  }
  res.status(200).json(metadata)
}

export default handler
