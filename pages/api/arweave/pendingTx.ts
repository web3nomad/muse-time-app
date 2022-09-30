import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { requireAuth, NextApiRequestWithAuth } from '@/lib/auth'

const handler = async function(
  req: NextApiRequestWithAuth,
  res: NextApiResponse
) {
  const response = await fetch(`https://arseed.web3infra.dev/bundle/orders/${req.user.walletAddress}`)
  const txs = await response.json()
  const tx = txs.find((tx) => tx.paymentStatus === 'paid' && tx.onChainStatus !== 'success')
  res.status(200).json({ tx })
}

export default requireAuth(handler)
