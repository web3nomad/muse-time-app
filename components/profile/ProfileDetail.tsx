import clsx from 'clsx'
import Image from 'next/image'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import { ArweaveResourceType, getArweaveData } from '@/lib/arweave'
import TransitionDialog from '@/components/TransitionDialog'
import type { ProfileData } from '@/lib/arweave'
import ProfileForm from './ProfileForm'
import { EditSquareIcon, CoffeeIcon, CalendarIcon } from '@/components/icons'

import IconTwitterCircle from '@/assets/images/icon-twitter-circle.svg'

const Avatar = ({ profile }: { profile: ProfileData }) => {
  return (
    <div className={clsx(
      "absolute top-0 -left-48 w-32 hidden lg:flex",
      "flex-col items-center justify-start"
    )}>
      {profile.avatar ? (
        <div
          className="w-32 h-32 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
          style={{backgroundImage: `url(${profile.avatar})`}}
        ></div>
      ) : (
        <div className="w-32 h-32 bg-neutral-100 rounded-full"></div>
      )}
      <div
        className="flex items-center h-5 pl-6 my-3 bg-no-repeat bg-contain bg-left text-sm font-medium"
        style={{backgroundImage: `url(${IconTwitterCircle.src})`}}
      >
        <a
          href={`https://twitter.com/${profile['com.twitter']}`}
          target="_blank" rel="noreferrer"
        >{profile['com.twitter'] || '-'}</a>
      </div>
    </div>
  )
}

export default function ProfileDetail({ resourceOwner, arOwnerAddress }: {
  resourceOwner: string,
  arOwnerAddress: string,
}) {
  const walletAddress = useRecoilValue(walletAddressState)
  const [profile, setProfile] = useState<ProfileData|null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const canEditProfile = useMemo(() => {
    return resourceOwner === walletAddress
  }, [resourceOwner, walletAddress])

  const fetchProfile = useCallback(() => {
    getArweaveData({
      arOwnerAddress: arOwnerAddress,
      resourceId: '',
      resourceType: ArweaveResourceType.PROFILE,
      resourceOwner: resourceOwner
    }).then(data => {
      setProfile(data)
    })
  }, [setProfile, resourceOwner, arOwnerAddress])

  const handleFormSubmit = useCallback((data: ProfileData) => {
    setDialogOpen(false)
    setProfile(data)
  }, [setDialogOpen, setProfile])

  useEffect(() => fetchProfile(), [fetchProfile])

  return profile ? (
    // profile loaded
    <div className="relative">
      <Avatar profile={profile} />
      <section className="relative mb-2">
        <div
          className="lg:hidden w-32 h-32 my-4 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
          style={profile.avatar ? {backgroundImage: `url(${profile.avatar})`} : {}}
        ></div>
        <div className="text-2xl font-medium">{profile.name}</div>
        <div className="text-xs sm:text-sm text-neutral-400 my-2">{resourceOwner}</div>
        <div className="flex items-center justify-start my-6">
          <div className="px-2 py-1 rounded-md border border-current text-xs leading-5 flex items-center">
            <CoffeeIcon className="w-4 h-4 mr-1" />
            <span>{0} Minted</span>
          </div>
          <div className="px-2 py-1 rounded-md border border-current text-xs leading-5 flex items-center ml-3">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{0} Pending</span>
          </div>
        </div>
        {canEditProfile && (
          <span className="absolute top-0 right-0 p-2 cursor-pointer" onClick={() => setDialogOpen(true)}>
            {/*<PencilSquareIcon className="w-6 h-6" />*/}
            <EditSquareIcon className="w-4 h-4" />
          </span>
        )}
      </section>
      <section className="relative my-16">
        <h3 className="text-3xl font-semibold my-4">Introduction</h3>
        <div>{profile.description}</div>
      </section>
      {resourceOwner === walletAddress && (
        <TransitionDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <ProfileForm profile={profile}
            onSubmit={handleFormSubmit} onCancel={() => setDialogOpen(false)} />
        </TransitionDialog>
      )}
    </div>
  ) : (
    // profile not loaded
    <div>loading profile ...</div>
  )
}
