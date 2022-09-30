import { providers } from 'ethers'
import getCurrency from 'bundlr-arseeding-client/build/web/currencies'
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder'

async function submitOrder({ tags, payload }) {
  const provider = new providers.Web3Provider((window as any).ethereum)
  await provider._ready()
  const currencyConfig = getCurrency('ethereum', provider)
  await currencyConfig.ready()
  const signer = await currencyConfig.getSigner()
  const arseedUrl = 'https://arseed.web3infra.dev'
  const dataRaw = Buffer.from(JSON.stringify(payload))
  const currency = 'AR'
  const options = {
    tags: [
      {name: 'Content-Type', value: 'application/json'},
      {name: 'App-Name', value: 'MuseTime'},
      ...tags,
    ]
  }
  const config =  {
    signer: signer,
    arseedUrl: arseedUrl,
    currency: currency,
  }
  const order = await createAndSubmitItem(dataRaw, options, config)
  return order
}

export async function updateArweaveData({
  id, type, payload,
  walletAddress,
  authToken,
}) {
  const tags = [
    {name: 'Data-ID', value: id},
    {name: 'Data-Type', value: type},
    {name: 'Data-Owner', value: walletAddress},
  ]
  const order = await submitOrder({ tags, payload })
  const res = await fetch('/api/arweave/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${authToken}`,
    },
    body: JSON.stringify({
      order: order
    })
  })
  const result = await res.json()
  return result
}
