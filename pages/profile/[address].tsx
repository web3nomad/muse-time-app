import type { GetServerSidePropsContext, NextPage } from 'next'
import useSWR from 'swr'
import { useEffect, Fragment, useState, useCallback } from 'react'
import Head from 'next/head'
import { useRecoilValue } from 'recoil'
import { Dialog, Transition } from '@headlessui/react'
import { PencilSquareIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import { walletAddressState, authTokenState } from '@/lib/recoil/wallet'
import { updateArweaveData, ArweaveDataType } from '@/lib/arweave'
import MainLayout from '@/components/layouts/MainLayout'

type ProfileData = {
  name: string,
  bio: string,
}

function ProfileForm({ profile, onSave }: {
  profile: ProfileData,
  onSave: any,
}) {
  const [pending, setPending] = useState(false)

  const [formData, setFormData] = useState<ProfileData>(
    profile ?? {
      name: "",
      bio: "",
    }
  )

  const onChange = useCallback((field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }, [formData, setFormData])

  const handleSubmit = (event: any) => {
    event.preventDefault()
    setPending(true)
    onSave({ ...formData })
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
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Name</label>
        <div className="mt-1 sm:col-span-2 sm:mt-0">
          <input
            className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            type="text"
            autoComplete="off"
            name="name"
            defaultValue={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={pending}
          />
        </div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Bio</label>
        <div className="mt-1 sm:col-span-2 sm:mt-0">
          <textarea
            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={3}
            autoComplete="off"
            name="bio"
            defaultValue={formData.bio}
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


function Modal({ open, onClose, children }: {
  open: boolean,
  onClose: any,
  children?: React.ReactNode,
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


const Page: NextPage<{addressSlug: string}> = ({ addressSlug }) => {
  const [profile, setProfile] = useState<ProfileData|null>(null)
  const walletAddress = useRecoilValue(walletAddressState)
  const authToken = useRecoilValue(authTokenState)

  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchProfile = useCallback(() => {
    fetch(`/api/profile/${addressSlug}`).then(async (res) => {
      const data = await res.json()
      setProfile(data)
    })
  }, [setProfile, addressSlug])

  const signAndSaveProfile = useCallback((payload: ProfileData) => {
    // console.log(payload)
    // const payload = {
    //   'from': 'web3nomad.eth',
    //   'message': 'Hi, web3nomad'
    // }
    updateArweaveData({
      id: walletAddress,
      type: ArweaveDataType.PROFILE,
      payload: payload,
      walletAddress: walletAddress,
      authToken: authToken,
    }).then((res) => {
      console.log(res)
      setDialogOpen(false)
    }).catch((err) => {
      console.log(err)
    })
  }, [walletAddress, authToken])

  useEffect(() => fetchProfile(), [fetchProfile])

  return (
    <MainLayout>
      <Head>
        <title>Profile {addressSlug}</title>
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
            <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <ProfileForm profile={profile} onSave={signAndSaveProfile} />
            </Modal>
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
