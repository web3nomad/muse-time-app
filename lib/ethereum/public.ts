import { ethers } from 'ethers'

export const chainId = +(process.env.NEXT_PUBLIC_CHAIN_ID ?? '31337')

const _publicRpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? 'http://localhost:8545'
export const publicProvider = new ethers.providers.JsonRpcProvider(_publicRpcUrl)

const _controllerAddress = process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS ?? '0x0000000000000000000000000000000000000000'
const _controllerABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"admin_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"implementation_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"topicOwner","type":"address"},{"indexed":true,"internalType":"string","name":"topicSlug","type":"string"},{"indexed":true,"internalType":"address","name":"tokenOwner","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"TimeTokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"topicOwner","type":"address"}],"name":"TimeTroveCreated","type":"event"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"arOwnerAddress","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"createTimeTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"museTimeNFT_","type":"address"},{"internalType":"string","name":"baseURI_","type":"string"},{"internalType":"address","name":"verificationAddress_","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"mintIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"mintKey","type":"uint256"},{"internalType":"uint256","name":"valueInWei","type":"uint256"},{"internalType":"address","name":"topicOwner","type":"address"},{"internalType":"string","name":"topicSlug","type":"string"},{"internalType":"string","name":"profileArId","type":"string"},{"internalType":"string","name":"topicsArId","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"mintTimeToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"museTimeNFT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"baseURI_","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setConfirmed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setFulfilled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setRejected","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"verificationAddress_","type":"address"}],"name":"setVerificationAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"timeTokenOf","outputs":[{"components":[{"internalType":"uint256","name":"valueInWei","type":"uint256"},{"internalType":"address","name":"topicOwner","type":"address"},{"internalType":"string","name":"topicSlug","type":"string"},{"internalType":"string","name":"profileArId","type":"string"},{"internalType":"string","name":"topicsArId","type":"string"},{"internalType":"enum MuseTimeController.TimeTokenStatus","name":"status","type":"uint8"}],"internalType":"struct MuseTimeController.TimeToken","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"topicOwner","type":"address"}],"name":"timeTroveOf","outputs":[{"components":[{"internalType":"string","name":"arOwnerAddress","type":"string"},{"internalType":"uint256","name":"balance","type":"uint256"}],"internalType":"struct MuseTimeController.TimeTrove","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"verificationAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"withdrawERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawFromTimeTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_logic","type":"address"},{"internalType":"address","name":"admin_","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"stateMutability":"payable","type":"constructor"}]
export const controllerContract = new ethers.Contract(_controllerAddress, _controllerABI, publicProvider)

const _nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS ?? '0x0000000000000000000000000000000000000000'
export const nftContract = new ethers.Contract(_nftAddress, [
  'function tokenURI(uint256 id) view returns (string memory)',
  'function ownerOf(uint256 id) view returns (address owner)',
], publicProvider)
