import clsx from 'clsx'
import { useState, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { walletAddressState, authTokenState } from '@/lib/recoil/wallet'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { syncArweaveData, ResourceTypes } from '@/lib/arweave'
import type { ProfileData } from '@/lib/arweave'


export default function ProfileForm({ profile, onSubmit, onCancel }: {
  profile: ProfileData,
  onSubmit: (profile: ProfileData) => void,
  onCancel: () => void,
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
    syncArweaveData({
      resourceId: '',
      resourceType: ResourceTypes.PROFILE,
      resourceOwner: walletAddress,
      payload: payload,
      authToken: authToken,
    }).then((res) => {
      setPending(false)
      onSubmit(payload)
    }).catch((err) => {
      setPending(false)
      console.log(err)
    })
  }, [walletAddress, authToken, onSubmit])

  const handleSubmit = (event: any) => {
    event.preventDefault()
    signAndSaveProfile({ ...formData })
  }

  const fields: Array<[keyof ProfileData, string]> = [
    ['name', 'Name'],
    ['avatar', 'Avatar URL'],
    ['url', 'Website'],
    ['email', 'Email'],
    ['com.twitter', 'Twitter ID'],
    ['org.telegram', 'Telegram ID'],
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h3 className="text-lg font-medium leading-6 text-neutral-900">Profile</h3>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500">
          This information will be displayed publicly so be careful what you share.
        </p>
      </div>
      <section className="my-4 py-2 border-y border-neutral-300 text-neutral-700">
        {fields.map(([fieldName, FieldDesc]) => (
          <div key={fieldName} className="my-3 flex flex-wrap items-center justify-start">
            <label htmlFor={fieldName} className="text-sm font-medium w-24">{FieldDesc}</label>
            <div className="mt-1 w-full sm:mt-0 sm:w-auto sm:flex-1">
              <input
                className="block w-full border-transparent focus:border-neutral-400 focus:ring-neutral-400 rounded-md text-sm"
                type="text"
                autoComplete="off"
                name={fieldName}
                defaultValue={formData[fieldName]}
                onChange={(e) => onChange(fieldName, e.target.value)}
                disabled={pending}
              />
            </div>
          </div>
        ))}
        <div className="my-3 flex flex-wrap items-center justify-start">
          <label htmlFor="description" className="text-sm font-medium w-24">Description</label>
          <div className="mt-1 w-full sm:mt-0 sm:w-auto sm:flex-1">
            <textarea
              className="block w-full border-transparent focus:border-neutral-400 focus:ring-neutral-400 rounded-md text-sm"
              rows={3}
              autoComplete="off"
              name="description"
              defaultValue={formData['description']}
              onChange={(e) => onChange('description', e.target.value)}
              disabled={pending}
            />
          </div>
        </div>
      </section>
      <div className="mt-4 flex items-center justify-end">
        <button
          type="button" disabled={pending} onClick={() => onCancel()}
          className={clsx(
            "w-24 rounded-md leading-6 py-1 px-4 text-sm text-neutral-900 shadow-sm",
            "bg-white/90 hover:bg-white/80 mr-4",
            "border border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
          )}
        >
          <span>Cancel</span>
        </button>
        <button
          type="submit" disabled={pending}
          className={clsx(
            "w-24 flex items-center justify-center rounded-md leading-6 py-1 px-4 text-sm text-white shadow-sm",
            "bg-neutral-900 hover:bg-neutral-800",
            "border border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
          )}
        >
          <span>Save</span>
          {pending && <ArrowPathIcon className="h-4 w-4 animate-spin ml-1" />}
        </button>
      </div>
    </form>
  )
}
