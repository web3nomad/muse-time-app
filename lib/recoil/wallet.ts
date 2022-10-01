import { atom, selector } from 'recoil'
import type { ChecksumAddress } from '@/lib/ethereum'

export const walletAddressState = atom<ChecksumAddress|null>({
  key: 'walletAddress',
  default: null,
})

export const authTokenState = atom<string|null>({
  key: 'authToken',
  default: null,
})
