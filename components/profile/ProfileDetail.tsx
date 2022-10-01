import { useEffect, useState, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import type { ProfileData } from '@/lib/arweave'
import { ArweaveResourceType, getArweaveData } from '@/lib/arweave'
import TransitionDialog from '@/components/TransitionDialog'
import ProfileForm from './ProfileForm'


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
    <div>
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
