import { atom, selector } from 'recoil'

export const walletAddressState = atom<string|null>({
  key: 'walletAddress',
  default: null,
})

export const authTokenState = atom<string|null>({
  key: 'authToken',
  default: null,
})
