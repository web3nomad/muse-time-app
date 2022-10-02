export type EverpayTx = {
  'id': number,
  'itemId': string,
  'paymentStatus': string,
  'paymentId': string,
  'onChainStatus': string
}
export type ArweaveDataPayload = {[_key:string]: unknown} | Array<{[_key:string]: unknown}>
export type ArweaveDataTag = {name:string,value:string}

export enum ArweaveResourceType {
  PROFILE = 'profile',
  TOPIC = 'topic',
  TOPICS = 'topics',
}

export type TopicData = {
  id: string,
  name: string,
  description: string,
  category: string,
  method: string,
  availability: string,
  value: string,
  duration: string,
}

export type ProfileData = {
  name: string,
  url: string,
  email: string,
  avatar: string,
  description: string,
  'com.twitter': string,
  'org.telegram': string,
}
