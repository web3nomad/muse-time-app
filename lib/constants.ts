import { ethers } from 'ethers'

export enum NETWORK {
  Mainnet = 1,
  Rinkeby = 4,
}

export const SUPPORTED_CHAINS = {
  [NETWORK.Mainnet]: 'mainnet',
  [NETWORK.Rinkeby]: 'rinkeby',
}

export const PUBLIC_PROVIDERS = {
  [NETWORK.Mainnet]: new ethers.providers.AlchemyProvider(NETWORK.Mainnet, 'CpskmE4wfrZCwpTD-RhG7DMIrSU5Ge1Q'),
  [NETWORK.Rinkeby]: new ethers.providers.AlchemyProvider(NETWORK.Rinkeby, 'CpskmE4wfrZCwpTD-RhG7DMIrSU5Ge1Q'),
}
