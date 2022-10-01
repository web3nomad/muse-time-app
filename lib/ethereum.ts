import { ethers } from 'ethers'

class ChecksumAddressClass {
  _address: string
  constructor(address: string) {
    this._address = ethers.utils.getAddress(address)
  }
  toString(): string {
    return this._address
  }
  masked(): string {
    return this._address.toLowerCase().replace(/0x(\w{4})\w+(\w{4})/, '0x$1...$2')
  }
  equals(address: ChecksumAddress|null): boolean {
    return address !== null && this.toString() == address.toString()
  }
}

export const getChecksumAddress = (address: string) => {
  return new ChecksumAddressClass(address)
}

export type ChecksumAddress = ChecksumAddressClass
