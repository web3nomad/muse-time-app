import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import MainLayout from '@/components/layouts/MainLayout'

const Home: NextPage = () => {
  return (
    <MainLayout>
      <h1>Welcome to <Link href="/"><a>MuseTime</a></Link></h1>
    </MainLayout>
  )
}

export default Home
