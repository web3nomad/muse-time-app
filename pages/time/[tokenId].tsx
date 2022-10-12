import clsx from 'clsx'
import useSWR from 'swr'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useEthereumContext } from '@/lib/ethereum/context'
import SiteHeader from '@/components/layouts/SiteHeader'
import { controllerContract, nftContract } from '@/lib/ethereum/public'
import type { TimeTokenData } from '@/lib/ethereum/types'

enum TimeTokenStatus {
  PENDING = 0,
  REJECTED = 1,
  CONFIRMED = 2,
  FULFILLED = 3,
}

type AttributeData = {
  trait_type: string,
  value: string
}

type TimeTokenMetadata = {
  name: string,
  description: string,
  image: string,
  external_url: string,
  attributes: AttributeData[],
}

type PageProps = {
  tokenId: number
}

const Page: NextPage<PageProps> = ({ tokenId }) => {
  const { walletAddress, signer, sendTransaction } = useEthereumContext()

  const fetcher = (method: string, tokenId: number) => nftContract[method](tokenId)
  const { data: tokenURI } = useSWR<string>(['tokenURI', tokenId], fetcher, { revalidateOnFocus: false })
  const { data: tokenOwner } = useSWR<string>(['ownerOf', tokenId], fetcher, { revalidateOnFocus: false })

  const metadataFetcher = (tokenURI: string) => {
    const url = tokenURI.replace(/^https:\/\/musetime\.xyz/, '')
    return fetch(url).then(res => res.json())
  }
  const { data: tokenMetadata } = useSWR<TimeTokenMetadata>(tokenURI, metadataFetcher, {
    revalidateOnFocus: false,
  })

  const { topicOwner, status } = useMemo(() => {
    const map: any = {}
    const attributes = tokenMetadata?.attributes ?? []
    attributes.forEach(({ trait_type, value }) => map[trait_type] = value)
    return map
  }, [tokenMetadata])

  const [inAction, setInAction] = useState<boolean>(false)
  const action = useCallback(async (methodName: string) => {
    setInAction(true)
    const method = controllerContract.connect(signer)[methodName](tokenId)
    await sendTransaction(method)
    setInAction(false)
  }, [signer, sendTransaction, setInAction, tokenId])

  const TokenActions = ({ tokenMetadata }: { tokenMetadata: TimeTokenMetadata }) => (
    <div className={clsx(
      "flex items-center justify-between mx-auto mt-4",
      "fixed left-0 bottom-0 w-full sm:relative sm:left-auto sm:bottom-auto sm:w-[450px]"
    )}>
      {tokenOwner === walletAddress && +status === TimeTokenStatus.CONFIRMED && (
        <button className={clsx(
          "text-sm rounded text-white bg-neutral-900 hover:bg-neutral-900/90",
          "p-2 flex-1 m-4"
        )} disabled={inAction} onClick={() => action('setFulfilled')}>Fulfill</button>
      )}
      {topicOwner === walletAddress && +status === TimeTokenStatus.PENDING && (
        <button className={clsx(
          "text-sm rounded text-neutral-900 bg-white hover:text-neutral-900/80",
          "p-2 flex-1 m-4"
        )} disabled={inAction} onClick={() => action('setRejected')}>Reject</button>
      )}
      {topicOwner === walletAddress && +status === TimeTokenStatus.PENDING && (
        <button className={clsx(
          "text-sm rounded text-white bg-orange-tangelo hover:bg-orange-tangelo/90",
          "p-2 flex-1 m-4"
        )} disabled={inAction} onClick={() => action('setConfirmed')}>Accept</button>
      )}
    </div>
  )

  return (
    <div className="bg-white-coffee min-h-screen overflow-hidden">
      <Head>
        <title>MuseTime</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SiteHeader className="bg-neutral-900 text-white" />
      <main className="px-4 pt-12 pb-16">
        <div className="w-48 mx-auto mb-12">
          <svg viewBox="0 0 244 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.5 44H6.45C4.95 43.8 3.95 42.25 3.95 40.3V12.8C6.1 28.5 24.7 29.1 24.7 44H33.25C31.8 43.8 30.8 42.25 30.8 40.3V11C30.8 9.05 31.8 7.55 33.25 7.3H27.3C28.8 7.55 29.8 9.05 29.8 11V38.45C27.1 27.75 9.05 26.95 9.05 7.3H0.5C1.95 7.55 2.95 9.05 2.95 11V40.3C2.95 42.25 1.95 43.8 0.5 44ZM35.998 44H46.998C45.548 43.8 44.548 42.25 44.548 40.3V26.15H51.198C53.148 26.15 54.648 27.15 54.898 28.6V22.7C54.648 24.15 53.148 25.15 51.198 25.15H44.548V8.35H55.698C57.698 8.35 59.198 9.65 60.248 11.6H60.548L58.948 7.3H35.998C37.448 7.55 38.448 9.05 38.448 11V40.3C38.448 42.25 37.448 43.8 35.998 44ZM63.593 11.6C64.643 9.65 66.143 8.35 68.143 8.35H75.593V40.3C75.593 42.25 74.593 43.8 73.143 44H84.143C82.693 43.8 81.693 42.25 81.693 40.3V8.35H89.143C91.143 8.35 92.643 9.65 93.693 11.6H93.993L92.393 7.3H64.893L63.293 11.6H63.593ZM109.24 7.3C110.69 7.55 111.69 9.05 111.69 11V40.3C111.69 42.25 110.69 43.8 109.24 44H122.24C130.69 44 137.59 35.8 137.59 25.65C137.59 15.55 130.69 7.3 122.24 7.3H109.24ZM117.79 12.65C117.79 10.45 118.24 8.15 120.84 8.15C125.09 8.15 129.44 15.5 130.99 24.25C132.69 33.75 130.14 42 125.29 42.8C124.94 42.85 124.54 42.9 124.19 42.9C121.29 42.9 117.79 40.95 117.79 35.1V12.65ZM141.65 30.95C141.65 38.75 146.8 44.75 154.25 44.75C158.8 44.75 161.8 42.65 163 37.5H162.2C161.45 40.35 159.7 43.45 156.35 43.45C153.65 43.45 150.9 41.3 149.05 37.95C147.05 33.6 150.15 28.95 155.5 28.25C160.95 27.55 162.9 26.05 162.9 23.6C162.9 22.7 162.55 21.7 161.9 20.8C160.85 19.15 159.4 16.6 159.4 13.25C159.4 9.65 161.6 5.75 166.2 5.75C170.7 5.75 172.1 9.15 172.1 11.8C172.1 15.75 167.35 17.75 164.2 17.95V18.45H167.3V37.95C167.3 41.25 167.9 44 171.4 44H176.9C174 43.45 172.7 41.65 172.7 37.5V18.45H175.7V17.95H172.7V11.8C172.7 7 169.35 5.25 166.2 5.25C162 5.25 158.75 8.45 158.75 13.3C158.75 15.4 159.35 17.5 160.35 19.25C158.7 18.05 156.4 17.2 153.45 17.2C146.95 17.2 141.65 22.5 141.65 30.95ZM154.25 18.05C157.9 18.05 159.5 20.75 159.5 22.75C159.5 24.85 158.35 26.75 154.3 27.75C150.4 28.7 147.7 31.6 147.65 34.8C147.6 34.65 147.55 34.45 147.5 34.3C144.95 26.7 149.05 18.05 154.25 18.05ZM185.2 44.75C188.45 44.75 191.05 43.15 192.35 40.7V41.55C192.35 43.4 193.15 44 194.8 44H199.9C198.6 43.8 197.7 42.45 197.7 40.7V24.3C197.7 20.2 194.55 17.2 189.65 17.2C184.8 17.2 182.7 19.85 182.7 22.15C182.7 24.45 185.05 25.75 187.4 25.75C187.45 25.75 187.5 25.75 187.55 25.75C186.3 25.15 185.9 23 185.9 21.85C185.9 19.9 187.2 17.7 189.4 17.7C191.35 17.7 192.35 19.5 192.35 21.4C192.35 24.15 189.55 26.25 185.05 28.05C180.5 29.85 177.1 32.2 177.1 36.65C177.1 42.35 181.75 44.75 185.2 44.75ZM182.55 36.6C182.55 32.9 183.7 30.25 186.6 28.45C188.9 27.05 191.3 26 192.35 23.65V38.3C191.85 41.65 189.3 43.35 187.3 43.35C184.4 43.35 182.55 40.05 182.55 36.6ZM201.916 17.95C203.216 18.1 204.116 19.5 204.116 21.2V40.7C204.116 42.45 203.216 43.8 201.916 44H211.666C210.366 43.8 209.466 42.45 209.466 40.7V21.2C209.466 19.5 210.366 18.1 211.666 17.95H205.266C208.816 17.1 210.416 14.3 210.416 11.9C210.416 11.15 210.016 9 207.766 9C207.016 9 206.366 9.35 205.916 9.9C206.566 5.15 211.666 0.999999 216.366 0.999999C219.066 0.999999 220.266 2.25 220.266 4.5C220.266 6.6 218.466 7.5 215.516 7.5H213.316C214.866 7.75 215.516 9.4 215.516 10.75V40.7C215.516 42.45 214.616 43.8 213.316 44H223.066C221.766 43.8 220.866 42.45 220.866 40.7V4.5C220.866 1.75 219.366 0.449997 216.366 0.449997C213.516 0.449997 210.916 1.55 208.466 3.95C205.916 6.45 204.866 9.65 205.316 12.1C205.516 13.3 206.566 14.2 207.766 14.2C208.416 14.2 209.016 13.95 209.466 13.5C208.266 17.05 204.616 17.95 201.916 17.95ZM225.293 36.55C225.293 41.6 228.543 44.75 233.793 44.75C237.243 44.75 243.393 42.65 243.393 37.4C243.393 29.1 230.443 27.75 230.443 22.25C230.443 19.1 233.043 17.75 235.343 17.75C239.943 17.75 241.943 22.55 241.093 26.35L241.493 26.5C241.943 25.2 242.793 24.2 243.843 22.8C243.843 20.95 240.493 17.2 235.243 17.2C231.393 17.2 226.343 18.95 226.343 24C226.343 31.95 238.993 33.05 238.993 39.4C238.993 42.35 236.443 44.1 233.393 44.1C228.343 44.1 227.693 38 230.043 34.75L226.443 32.55C225.843 33.35 225.293 34.9 225.293 36.55Z" fill="#292929"/>
          </svg>
        </div>
        {tokenMetadata && (
          <div>
            <div className="max-w-[450px] mx-auto">
              <picture><img src={tokenMetadata.image} alt="" className="block w-full" /></picture>
            </div>
            <TokenActions tokenMetadata={tokenMetadata} />
          </div>
        )}
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async function ({ query }) {
  const tokenId = +(query.tokenId as string)
  return {
    props: {
      tokenId
    }
  }
}

export default Page

/*
<div>tokenURI: {tokenURI}</div>
{tokenMetadata.attributes.map(({trait_type, value}) => <div key={trait_type}>{trait_type}: {value}</div>)}
*/
