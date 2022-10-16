import base64url from 'base64url'
import { ethers } from 'ethers'

export function bytes32ToBase64Url(_bytes32: string) {
  // bytes32: 0x followed by 64 length hex code
  if (_bytes32 === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return ''
  }
  return base64url.encode(Buffer.from(ethers.utils.arrayify(_bytes32)))
}

export function base64UrlToBytes32(_base64url: string) {
  if (_base64url === '') {
    return '0x0000000000000000000000000000000000000000000000000000000000000000'
  }
  return '0x' + base64url.toBuffer(_base64url).toString('hex')
}
