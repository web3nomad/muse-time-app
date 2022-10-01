import { useState, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { walletAddressState, authTokenState } from '@/lib/recoil/wallet'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { updateArweaveData, ArweaveResourceType } from '@/lib/arweave'
import type { ProfileData } from '@/lib/arweave'

export default function ProfileForm({ profile, onSaveSuccess }: {
  profile: ProfileData,
  onSaveSuccess: any,
}) {
  const walletAddress = useRecoilValue(walletAddressState)
  const authToken = useRecoilValue(authTokenState)

  const [pending, setPending] = useState(false)
  const [formData, setFormData] = useState<ProfileData>(profile)

  const onChange = useCallback((field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }, [formData, setFormData])

  const signAndSaveProfile = useCallback((payload: ProfileData) => {
    if (!walletAddress || !authToken) {
      return
    }
    setPending(true)
    updateArweaveData({
      resourceId: '',
      resourceType: ArweaveResourceType.PROFILE,
      payload: payload,
      walletAddress: walletAddress,
      authToken: authToken,
    }).then((res) => {
      setPending(false)
      onSaveSuccess()
    }).catch((err) => {
      setPending(false)
      console.log(err)
    })
  }, [walletAddress, authToken, onSaveSuccess])

  const handleSubmit = (event: any) => {
    event.preventDefault()
    signAndSaveProfile({ ...formData })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 divide-y divide-gray-200">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          This information will be displayed publicly so be careful what you share.
        </p>
      </div>
      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Name</label>
        <div className="mt-1 sm:col-span-2 sm:mt-0">
          <input
            className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            type="text"
            autoComplete="off"
            name="name"
            defaultValue={formData['name']}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={pending}
          />
        </div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Bio</label>
        <div className="mt-1 sm:col-span-2 sm:mt-0">
          <textarea
            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={3}
            autoComplete="off"
            name="bio"
            defaultValue={formData['bio']}
            onChange={(e) => onChange('bio', e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="mt-1 sm:col-span-3 sm:mt-0">
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={pending}
          >
            <span>Confirm</span>
            {pending && <ArrowPathIcon className="h-5 w-5 animate-spin ml-2" />}
          </button>
        </div>
      </div>
    </form>
  )
}
