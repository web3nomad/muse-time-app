import { ethers } from 'ethers'

export const chainId = +(process.env.NEXT_PUBLIC_CHAIN_ID ?? '31337')

const _publicRpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? 'http://localhost:8545'
export const publicProvider = new ethers.providers.JsonRpcProvider(_publicRpcUrl)

const _controllerAddress = process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS ?? '0x0000000000000000000000000000000000000000'
const _controllerABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"topicOwner","type":"address"},{"indexed":true,"internalType":"bytes32","name":"topicId","type":"bytes32"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"tokenOwner","type":"address"},{"indexed":false,"internalType":"bytes32","name":"profileArId","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"topicsArId","type":"bytes32"}],"name":"TimeTokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"topicOwner","type":"address"}],"name":"TimeTroveCreated","type":"event"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"bytes32","name":"arOwnerAddress","type":"bytes32"},{"internalType":"address","name":"topicOwner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"internalType":"struct MuseTimeController.CreateTimeTroveParams[]","name":"params","type":"tuple[]"}],"name":"createTimeTroves","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"museTimeNFT_","type":"address"},{"internalType":"string","name":"baseURI_","type":"string"},{"internalType":"address","name":"paramsSigner_","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"mintIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"expired","type":"uint256"},{"internalType":"uint256","name":"valueInWei","type":"uint256"},{"internalType":"bytes32","name":"profileArId","type":"bytes32"},{"internalType":"bytes32","name":"topicsArId","type":"bytes32"},{"internalType":"bytes32","name":"topicId","type":"bytes32"},{"internalType":"address","name":"topicOwner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"mintTimeToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"museTimeNFT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"paramsSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"baseURI_","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setConfirmed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setFulfilled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"paramsSigner_","type":"address"}],"name":"setParamsSigner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setRejected","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"timeTokenOf","outputs":[{"components":[{"internalType":"uint256","name":"valueInWei","type":"uint256"},{"internalType":"address","name":"topicOwner","type":"address"},{"internalType":"enum MuseTimeController.TimeTokenStatus","name":"status","type":"uint8"}],"internalType":"struct MuseTimeController.TimeToken","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"topicOwner","type":"address"}],"name":"timeTroveOf","outputs":[{"components":[{"internalType":"bytes32","name":"arOwnerAddress","type":"bytes32"},{"internalType":"uint256","name":"balance","type":"uint256"}],"internalType":"struct MuseTimeController.TimeTrove","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"withdrawERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawFromTimeTrove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
export const controllerContract = new ethers.Contract(_controllerAddress, _controllerABI, publicProvider)

const _nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS ?? '0x0000000000000000000000000000000000000000'
export const nftContract = new ethers.Contract(_nftAddress, [
  'function tokenURI(uint256 id) view returns (string memory)',
  'function ownerOf(uint256 id) view returns (address owner)',
], publicProvider)
