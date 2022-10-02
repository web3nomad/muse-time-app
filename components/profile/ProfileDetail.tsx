import clsx from 'clsx'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import type { ProfileData } from '@/lib/arweave'
import { ArweaveResourceType, getArweaveData } from '@/lib/arweave'
import TransitionDialog from '@/components/TransitionDialog'
import ProfileForm from './ProfileForm'

import IconTwitterCircle from '@/assets/images/icon-twitter-circle.svg'

const Avatar = () => {
  const twitterHandle = 'web3nomad'
  return (
    <div className={clsx(
      "absolute top-0 -left-64 w-48 hidden lg:flex",
      "flex-col items-center justify-start"
    )}>
      <div
        className="w-36 h-36 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
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

  return (
    <div className="relative">
      <Avatar />
      <h3 className="flex items-center">
        <span>{resourceOwner}</span>
        {resourceOwner === walletAddress && (
          <span className="p-2 ml-2 cursor-pointer" onClick={() => setDialogOpen(true)}>
            <PencilSquareIcon className="w-6 h-6" />
          </span>
        )}
      </h3>
      {profile ? (
        <>
          <div>{profile.name}</div>
          <div>{profile.bio}</div>
          {resourceOwner === walletAddress && (
            <TransitionDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <ProfileForm profile={profile} onSaveSuccess={onSaveSuccess} />
            </TransitionDialog>
          )}
        </>
      ) : <div>loading profile ...</div>}
    </div>
  )
}
