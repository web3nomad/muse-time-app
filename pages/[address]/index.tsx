import type { GetServerSidePropsContext, NextPage } from 'next'
import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import type { ProfileData } from '@/lib/arweave'
import MainLayout from '@/components/layouts/MainLayout'
import TransitionDialog from '@/components/TransitionDialog'
import ProfileForm from '@/components/ProfileForm'


const Page: NextPage<{addressSlug: string}> = ({
  addressSlug
}) => {
  const walletAddress = useRecoilValue(walletAddressState)
  const [profile, setProfile] = useState<ProfileData|null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchProfile = useCallback(() => {
    fetch(`/api/profile/${addressSlug}`).then(async (res) => {
      const data = await res.json()
      setProfile(data)
    })
  }, [setProfile, addressSlug])

  useEffect(() => fetchProfile(), [fetchProfile])

  return (
    <MainLayout>
      <Head>
        <title>{'Profile ' + addressSlug}</title>
      </Head>
      <h3 className="flex items-center">
        <span>{addressSlug}</span>
        {addressSlug === walletAddress && (
          <span className="p-2 ml-2 cursor-pointer" onClick={() => setDialogOpen(true)}>
            <PencilSquareIcon className="w-6 h-6" />
          </span>
        )}
      </h3>
      {profile ? (
        <>
          <div>{profile.name}</div>
          <div>{profile.bio}</div>
          {addressSlug === walletAddress && (
            <TransitionDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <ProfileForm profile={profile} onSaveSuccess={() => setDialogOpen(false)} />
            </TransitionDialog>
          )}
        </>
      ) : <div>loading profile ...</div>}
    </MainLayout>
  )
}

export const getServerSideProps = async function ({
  query,
  req,
}: GetServerSidePropsContext) {
  const addressSlug = (query.address ?? '') as string
  return {
    props: {
      addressSlug
    }
  }
}

export default Page
