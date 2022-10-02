import clsx from 'clsx'
import Image from 'next/image'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import type { ProfileData } from '@/lib/arweave'
import { ArweaveResourceType, getArweaveData } from '@/lib/arweave'
import TransitionDialog from '@/components/TransitionDialog'
import ProfileForm from './ProfileForm'
// import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { EditSquareIcon } from '@/components/icons'

import IconTwitterCircle from '@/assets/images/icon-twitter-circle.svg'

const Avatar = () => {
  const twitterHandle = 'web3nomad'
  return (
    <div className={clsx(
      "absolute top-0 -left-48 w-32 hidden lg:flex",
      "flex-col items-center justify-start"
    )}>
      <div
        className="w-32 h-32 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
        style={{backgroundImage: `url("https://api.hippyghosts.io/~/storage/images/raw/524")`}}
      ></div>
      <div
        className="flex items-center h-5 pl-6 my-3 bg-no-repeat bg-contain bg-left text-sm font-medium"
        style={{backgroundImage: `url(${IconTwitterCircle.src})`}}
      >
        <a
          href={`https://twitter.com/${twitterHandle}`}
          target="_blank" rel="noreferrer"
        >{twitterHandle}</a>
      </div>
    </div>
  )
}

export default function ProfileDetail({ resourceOwner }: {
  resourceOwner: string
}) {
  const walletAddress = useRecoilValue(walletAddressState)
  const [profile, setProfile] = useState<ProfileData|null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const canEditProfile = useMemo(() => {
    return resourceOwner === walletAddress
  }, [resourceOwner, walletAddress])

  const fetchProfile = useCallback(() => {
    getArweaveData({
      resourceId: '',
      resourceType: ArweaveResourceType.PROFILE,
      resourceOwner: resourceOwner
    }).then(data => {
      setProfile(data)
    })
  }, [setProfile, resourceOwner])

  const onSaveSuccess = useCallback((data: ProfileData) => {
    setDialogOpen(false)
    setProfile(data)
  }, [setDialogOpen, setProfile])

  useEffect(() => fetchProfile(), [fetchProfile])

  return profile ? (
    // profile loaded
    <div className="relative">
      <Avatar />
      <section className="relative mb-2">
        <div className="text-2xl font-medium">{profile.name}</div>
        <div className="text-sm text-neutral-400 mt-2 mb-4">{resourceOwner}</div>
        {canEditProfile && (
          <span className="absolute top-0 right-0 p-2 cursor-pointer" onClick={() => setDialogOpen(true)}>
            {/*<PencilSquareIcon className="w-6 h-6" />*/}
            <EditSquareIcon className="w-4 h-4" />
          </span>
        )}
      </section>
      <section className="relative my-16">
        <h3 className="text-3xl font-semibold my-4">Introduction</h3>
        <div>{profile.bio}</div>
      </section>
      {resourceOwner === walletAddress && (
        <TransitionDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <ProfileForm profile={profile} onSaveSuccess={onSaveSuccess} />
        </TransitionDialog>
      )}
    </div>
  ) : (
    // profile not loaded
    <div>loading profile ...</div>
  )
}
