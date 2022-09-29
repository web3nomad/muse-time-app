import React, { ReactNode } from 'react'
import clsx from 'clsx'
import Head from 'next/head'
import SiteHeader from '@/components/SiteHeader'

type Props = {
  children?: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="bg-slate-100 min-h-screen overflow-hidden">
      <Head>
        <title>MuseTime</title>
        <meta name="description" content="MuseTime 是一个时间x空间的交易工具，在这个高维的世界里，时间和空间可以自由转换" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SiteHeader />
      <div className="flex items-center justify-center mt-16 mb-8">
        <h2 className="text-right">
          <span className="text-6xl inline-block mb-4">"Time is money"</span>
          <br/>
          <span className="inline-block mr-4">- Bemjamin</span>
        </h2>
      </div>
      <main className={clsx(
        "mx-24 mb-8 px-12 py-8",
        "bg-white border-4 border-black rounded-2xl"
      )}>
        {children}
      </main>
    </div>
  )
}
