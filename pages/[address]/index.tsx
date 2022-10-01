import type { GetServerSidePropsContext, GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { ethers } from 'ethers'
import MainLayout from '@/components/layouts/MainLayout'
import ProfileDetail from '@/components/profile/ProfileDetail'
import TopicsList from '@/components/topics/TopicsList'

type PageProps = {
  addressSlug: string
}

const Page: NextPage<PageProps> = ({ addressSlug }) => {
  return (
    <MainLayout>
      <Head>
        <title>{'Profile ' + addressSlug}</title>
      </Head>
      <ProfileDetail resourceOwner={addressSlug}/>
      <TopicsList resourceOwner={addressSlug}/>
    </MainLayout>
  )
}

// export const getServerSideProps = async function ({ query }: GetServerSidePropsContext) {
export const getServerSideProps: GetServerSideProps = async function ({ query }) {
  const addressSlug = ethers.utils.getAddress(query.address as string)
  return {
    props: {
      addressSlug
    }
  }
}

export default Page
