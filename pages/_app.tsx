import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { RecoilRoot } from 'recoil'
import { EthereumContextProvider } from '@/lib/ethereum/context'
import Router from 'next/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })
Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <EthereumContextProvider>
        <Component {...pageProps} />
      </EthereumContextProvider>
    </RecoilRoot>
  )
}

export default MyApp
