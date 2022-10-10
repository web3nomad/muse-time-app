import clsx from 'clsx'
import Image from 'next/image'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useEthereumContext } from '@/lib/ethereum/context'
import { ResourceTypes, getArweaveData } from '@/lib/arweave'
import TransitionDialog from '@/components/TransitionDialog'
import type { ProfileData } from '@/lib/arweave'
import ProfileForm from './ProfileForm'
import { EditSquareIcon, CoffeeIcon, CalendarIcon, TwitterIcon } from '@/components/icons'
import DocumentImage from '@/assets/images/document.svg'

const MOCK_PROFILE: ProfileData = {
  'name': '',
  'url': '',
  'email': '',
  'avatar': '',
  'description': '',
  'com.twitter': '',
  'org.telegram': '',
}

const Avatar = ({ profile }: { profile: ProfileData }) => {
  return (
    <div
      className={clsx(
        "absolute top-0 -left-48 w-32 hidden lg:flex",
        "flex-col items-center justify-start"
      )}
    >
      {profile.avatar ? (
        <div
          className="w-32 h-32 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
          style={{
            backgroundImage: `url(${
              "https://cloudflare-ipfs.com/ipfs/" + profile.avatar
            })`,
          }}
        ></div>
      ) : (
        <div className="w-32 h-32 bg-neutral-100 rounded-full"></div>
      )}
      <div className="flex items-center text-sm my-3 font-din-alternate">
        <TwitterIcon className="w-6 h-6" />
        {profile["com.twitter"] && (
          <a
            href={`https://twitter.com/${profile["com.twitter"]}`}
            target="_blank"
            rel="noreferrer"
            className="ml-2"
          >
            {profile["com.twitter"]}
          </a>
        )}
      </div>
    </div>
  );
}

export default function ProfileDetail({ resourceOwner, arOwnerAddress }: {
  resourceOwner: string,
  arOwnerAddress: string,
}) {
  const { walletAddress } = useEthereumContext()
  const [profile, setProfile] = useState<ProfileData>(MOCK_PROFILE)
  const [dialogOpen, setDialogOpen] = useState(false)

  const canEditProfile = useMemo(() => {
    return resourceOwner === walletAddress
  }, [resourceOwner, walletAddress])

  const fetchProfile = useCallback(() => {
    getArweaveData({
      arOwnerAddress: arOwnerAddress,
      resourceId: '',
      resourceType: ResourceTypes.PROFILE,
      resourceOwner: resourceOwner
    }).then(data => {
      setProfile(data ?? MOCK_PROFILE)
    })
  }, [setProfile, resourceOwner, arOwnerAddress])

  const handleFormSubmit = useCallback((data: ProfileData) => {
    setDialogOpen(false)
    setProfile(data)
  }, [setDialogOpen, setProfile])

  useEffect(() => fetchProfile(), [fetchProfile])

  return (
    <section className="relative">
      <Avatar profile={profile} />
      <div className="relative mb-2">
        <div
          className="lg:hidden w-32 h-32 my-4 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
          style={profile.avatar ? {backgroundImage: `url(${profile.avatar})`} : {}}
        ></div>
        <div className="text-2xl font-din-alternate">{profile.name || '-'}</div>
        <div className="text-xs text-neutral-400 my-2 font-din-alternate">{resourceOwner}</div>
        <div className="flex items-center justify-start my-6 font-din-alternate">
          <div className="px-2 py-1 rounded-md border border-current text-sm flex items-center">
            <CoffeeIcon className="w-4 h-4 mr-1" />
            <span>{0} Minted</span>
          </div>
          <div className="px-2 py-1 rounded-md border border-current text-sm flex items-center ml-3">
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
      </div>
      <div className="relative my-16">
        <h3 className="text-3xl font-bold my-4">Introduction</h3>
        {profile.description ? (
          <div className="font-din-pro">{profile.description}</div>
        ) : (
          <div className="relative w-20 h-20 mt-6">
            <Image src={DocumentImage.src} layout="fill" alt="document" />
          </div>
        )}
      </div>
      {resourceOwner === walletAddress && (
        <TransitionDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <ProfileForm profile={profile}
            onSubmit={handleFormSubmit} onCancel={() => setDialogOpen(false)} />
        </TransitionDialog>
      )}
    </section>
  )
}
