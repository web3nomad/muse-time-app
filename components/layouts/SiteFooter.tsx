import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
// import { useEffect, useState } from 'react'
import ConnectButton from '@/components/ConnectButton'
import { MuseTimeLogoIcon, MuseTimeTextIcon } from '@/components/icons'

import BMRLabImage from '@/assets/images/bmrlab-w.svg'
import HippyGhostsImage from '@/assets/images/hippyghosts-w.svg'
import MuseDAMImage from '@/assets/images/muse-dam.svg'
import MuseLinkImage from '@/assets/images/muse-link.svg'
import MuseTransferImage from '@/assets/images/muse-transfer.svg'


export default function SiteFooter({ className }: { className: string }) {
  return (
    <footer className={clsx(
      "py-4 px-2 md:px-6 w-full flex flex-col sm:flex-row items-center justify-between",
      className,
    )}>
      <div className="flex flex-col sm:flex-row items-center justify-evenly sm:justify-between">
        <div className="font-din-pro text-sm text-center p-3">MADE WITH GAS BY</div>
        <div className="flex items-center justify-center">
          <a className="block relative w-32 h-6 sm:w-36 sm:h-8" href="https://hippyghosts.io" target="_blank" rel="noreferrer">
            <Image src={HippyGhostsImage.src} layout="fill" alt="https://hippyghosts.io" />
          </a>
          <a className="block relative w-12 h-6 ml-2 sm:w-16 sm:h-8 sm:ml-4" href="https://bmr.art" target="_blank" rel="noreferrer">
            <Image src={BMRLabImage.src} layout="fill" alt="https://bmr.art" />
          </a>
          {/*<a className="block relative w-6 h-6 ml-2 sm:w-8 sm:h-8 sm:ml-4" href="https://musetransfer.com" target="_blank" rel="noreferrer">
            <Image src={MuseTransferImage.src} layout="fill" alt="https://musetransfer.com" />
          </a>
          <a className="block relative w-6 h-6 ml-2 sm:w-8 sm:h-8 sm:ml-4" href="https://dam.musetransfer.com" target="_blank" rel="noreferrer">
            <Image src={MuseDAMImage.src} layout="fill" alt="https://dam.musetransfer.com" />
          </a>
          <a className="block relative w-6 h-6 ml-2 sm:w-8 sm:h-8 sm:ml-4" href="https://muselink.cc" target="_blank" rel="noreferrer">
            <Image src={MuseLinkImage.src} layout="fill" alt="https://muselink.cc" />
          </a>*/}
        </div>
      </div>
      <div className="font-din-pro p-3 mt-2 sm:mt-0">
        <div className="text-sm flex items-center justify-center sm:justify-start">
          <div className="mr-1">INCUBATED BY</div>
          <a href="https://exnew.finding3.io" target="_blank" rel="noreferrer">
            <picture>
              <img className="h-3" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgyIiBoZWlnaHQ9IjUyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTExOC4zNDYgMjguMjk1aC03LjY5NnYtNy43NTJjMC0uNjI3LjUwNy0xLjEzNSAxLjEzMy0xLjEzNWg1LjQyOWMuNjI2IDAgMS4xMzQuNTA4IDEuMTM0IDEuMTM1djcuNzUyWk0xMjEuNjAyIDEyaC0xNC4yMDRjLTQuMDg2IDAtNy4zOTggMy4zMTctNy4zOTggNy40MDhWNDQuNTkzYzAgNC4wOSAzLjMxMiA3LjQwNyA3LjM5OCA3LjQwN2gxNC4yMDRjNC4wODYgMCA3LjM5OC0zLjMxNyA3LjM5OC03LjQwN3YtNS42M2gtMTAuNjUzdjQuNDk1YzAgLjYyNi0uNTA4IDEuMTM1LTEuMTM0IDEuMTM1aC01LjQyNmExLjEzNCAxLjEzNCAwIDAgMS0xLjEzNC0xLjEzNXYtOC4wNUgxMjl2LTE2YzAtNC4wOTEtMy4zMTItNy40MDgtNy4zOTgtNy40MDhaTTE3MS41NjQgMTJsLTQuMjM0IDMwLjQyTDE2MS40MjMgMTJoLTkuODQ2bC01LjkwNyAzMC40MkwxNDEuNDM2IDEySDEzMWw4LjY2NCA0MGgxMi40MDZsNC40My0yMy43MDVMMTYwLjkzIDUyaDEyLjQwNkwxODIgMTJ6TTgzLjQ1NyAwaC05LjkxNEM2OC4yNzMgMCA2NCA0LjI1OCA2NCA5LjUxVjUyaDEwLjY1M1Y5LjI2NWMwLS45OTEuODA2LTEuNzk0IDEuOC0xLjc5NGg0LjA5NGMuOTk0IDAgMS44LjgwMyAxLjggMS43OTRWNTJIOTNWOS41MUM5MyA0LjI1OSA4OC43MjcgMCA4My40NTcgMCIgZmlsbD0iIzFFQjEwMCIvPjxwYXRoIGZpbGw9IiMwMjcwMDIiIGQ9Ik00OS42NjggMzEuODQ1IDU5LjEzOCAxM2gtMTEuNzlMNDMgMjQuMTMgMzguNjUxIDEzaC0xMS43OWw5LjQ3IDE4Ljg0NUwyNiA1MmgxMS4yMDJMNDMgMzguOTYxIDQ4Ljc5OCA1Mkg2MHpNMCAwdjUyaDIydi05Ljk1M0gxMC4zMDh2LTExLjA3SDIydi05Ljk1M0gxMC4zMDhWOS45NTNIMjJWMEgxMC4zMDh6Ii8+PC9nPjwvc3ZnPg==" alt="" />
            </picture>
          </a>
        </div>
        <div className="text-xs text-center sm:text-left">A decentralized career growth community</div>
      </div>
    </footer>
  )
}
