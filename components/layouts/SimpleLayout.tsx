import { ReactNode } from 'react'
import SiteHeader from './SiteHeader'
import PendingTx from '@/components/PendingTx'
import HeadMeta from '@/components/layouts/HeadMeta'

type Props = {
  children?: ReactNode
}

export default function SimpleLayout({ children }: Props) {
  return (
    <div className="bg-white-coffee min-h-screen overflow-hidden flex flex-col items-center justify-start">
      <HeadMeta />
      <SiteHeader className="bg-neutral-900 text-white" />
      {children}
      <PendingTx />
    </div>
  )
}
