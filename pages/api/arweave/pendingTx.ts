import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { requireAuth, NextApiRequestWithAuth } from '@/lib/auth'
import type { EverpayTx } from '@/lib/arweave'

const handler = async function(
  req: NextApiRequestWithAuth,
  res: NextApiResponse
) {
  const response = await fetch(`https://arseed.web3infra.dev/bundle/orders/${req.user.walletAddress}`)
  const txs = await response.json()
  // const tx = txs[0]
  const tx = txs.find((tx: EverpayTx) => tx.paymentStatus === 'paid' && tx.onChainStatus !== 'success')
  if (tx) {
    res.status(200).json(tx)
  } else {
    res.status(404).end()
  }
}

export default requireAuth(handler)
