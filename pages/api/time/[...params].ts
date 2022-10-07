// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type { TopicData } from '@/lib/arweave'
import { controllerContract } from '@/lib/ethereum/public'
import type { TimeToken } from '@/lib/ethereum/types'

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

async function findTopic(topicSlug: string, arId: string): Promise<TopicData|null> {
  const url = `https://arseed.web3infra.dev/${arId}`
  try {
    const topics: TopicData[] = await fetch(url).then(res => res.json())
    const topic = topics.find(({ id }) => id === topicSlug)
    return topic ?? null
  } catch(err) {
    console.log(err)
    return null
  }
}

async function findTimeToken(tokenId: number): Promise<TimeToken> {
  const timeToken: TimeToken = await controllerContract.timeTokenOf(+tokenId)
  return timeToken
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
  const [tokenId, topicSlug, arId] = params
  const [topic, timeToken] = await Promise.all([
    findTopic(topicSlug, arId),
    findTimeToken(+tokenId),
  ])
  if (!topic) {
    res.status(404).end()
    return
  }
  const attributes = [
    { trait_type: 'category', value: topic['category'] },
    { trait_type: 'value', value: topic['value'] },
    { trait_type: 'duration', value: topic['duration'] },
    { trait_type: 'method', value: topic['method'] },
    { trait_type: 'valueInWei', value: timeToken['valueInWei'].toString() },
    { trait_type: 'topicOwner', value: timeToken['topicOwner'] },
    { trait_type: 'topicSlug', value: timeToken['topicSlug'] },
    { trait_type: 'arId', value: timeToken['arId'] },
    { trait_type: 'status', value: timeToken['status'] },
  ]
  const metadata = {
    name: topic.name,
    description: topic.description,
    image: '',
    external_url: `https://musetime.xyz/time/${tokenId}`,
    attributes: attributes
  }
  res.status(200).json(metadata)
}

export default handler
