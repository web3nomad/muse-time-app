import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import ConnectButton from '@/components/ConnectButton'
import styles from '../styles/Test.module.css'

const Test: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>MuseTime</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <Link href="/"><a>MuseTime</a></Link>
        </h1>
        <div className="my-16">
          <ConnectButton />
        </div>
        <div className="my-16">
          {/*<Calendar />*/}
        </div>
      </main>
    </div>
  )
}

export default Test
