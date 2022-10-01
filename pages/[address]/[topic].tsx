import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import MainLayout from '@/components/layouts/MainLayout'

const Page: NextPage<{topicSlug: string}> = ({ topicSlug }) => {
  return (
    <MainLayout>
      <h1>Topic {topicSlug}</h1>
    </MainLayout>
  )
}

export const getServerSideProps = async function ({ query }: GetServerSidePropsContext) {
  const topicSlug = (query.topic ?? '') as string
  return {
    props: {
      topicSlug
    }
  }
}

export default Page
