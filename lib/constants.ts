export const EIP_712_AUTH = {
  types: {
    Auth: [
        { name: 'intent', type: 'string' },
        { name: 'wallet', type: 'address' },
        { name: 'expire', type: 'uint256' },
    ]
  },
  domain: {}
}
