// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const keyfile = JSON.parse(process.env.ARWEAVE_KEYFILE)
  res.status(200).json({
    // keyfile: keyfile
  })
}
