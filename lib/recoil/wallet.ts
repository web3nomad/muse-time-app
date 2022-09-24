import { atom, selector } from 'recoil'

export const walletAddressState = atom({
  key: 'walletAddress',
  default: '',
})

export const authTokenState = atom({
  key: 'authToken',
  default: '',
})
