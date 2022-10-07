import clsx from 'clsx'
import { ethers } from 'ethers'
import { useState, useCallback } from 'react'
import type { TopicData } from '@/lib/arweave'

type FormData = {
  name: string,
  description: string,
  category: string,
  method: string,
  availabilityFrom: string,
  availabilityTo: string,
  etherValue: string,
  hours: string,
}

const topicToFormData = (topic: TopicData): FormData => {
  const formData: FormData = {
    name: topic['name'] ?? '',
    description: topic['description'] ?? '',
    category: topic['category'] ?? '',
    method: topic['method'] ?? '',
    availabilityFrom: '',
    availabilityTo: '',
    etherValue: '',
    hours: '',
  }
  const matchDuration = (topic['duration'] ?? '').match(/^([\d\.])+h$/)
  if (matchDuration) {
    formData['hours'] = (+matchDuration[1] || '').toString()
  } else {
    formData['hours'] = ''
  }
  try {
    const [val, unit] = topic['value'].split(' ')
    const wei = ethers.utils.parseUnits(val, unit)
    formData['etherValue'] = ethers.utils.formatEther(wei)
  } catch(err) {
    formData['etherValue'] = ''
  }
  const matchAvailability = (topic['availability'] ?? '').match(/^\((\d{4}-\d{2}-\d{2})?,(\d{4}-\d{2}-\d{2})?\)$/)
  if (matchAvailability) {
    formData['availabilityFrom'] = matchAvailability[1] || ''
    formData['availabilityTo'] = matchAvailability[2] || ''
  } else {
    formData['availabilityFrom'] = formData['availabilityTo'] = ''
  }
  return formData
}

const formDataToTopic = (formData: FormData): Omit<TopicData, 'id'> => {
  const topic: Omit<TopicData, 'id'> = {
    name: formData['name'] ?? '',
    description: formData['description'] ?? '',
    category: formData['category'] ?? '',
    method: formData['method'] ?? '',
    availability: `(${formData['availabilityFrom'] ?? ''},${formData['availabilityTo'] ?? ''})`,
    value: formData['etherValue'] ? `${formData['etherValue']} ether` : '',
    duration: formData['hours'] ? `${formData['hours']}h` : '',
  }
  return topic
}


export default function TopicForm({ topic, onSubmit, onCancel }: {
  topic: TopicData,
  onSubmit: (profile: TopicData) => void,
  onCancel: () => void,
}) {
  const [formData, setFormData] = useState<FormData>(topicToFormData(topic))

  const onChange = useCallback((field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }, [formData, setFormData])

  const handleSubmit = (event: any) => {
    event.preventDefault()
    onSubmit({
      ...topic,
      ...formDataToTopic(formData),
    })
  }

  const inputClassNames = 'mt-1 block w-full border-transparent focus:border-neutral-400 focus:ring-neutral-400 rounded-md text-sm'

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium leading-6 text-neutral-900">Time NFT</h3>
      <section className="my-4 py-2 border-y border-neutral-300 text-neutral-700">
        <div className="my-3 w-full">
          <label htmlFor="name" className="text-sm font-medium w-24">Name</label>
          <input
            className={inputClassNames} type="text" autoComplete="off"
            name="name" defaultValue={formData['name']}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        <div className="my-3 w-full flex flex-wrap items-center justify-start">
          <div className="flex-1 mr-1">
            <label htmlFor="etherValue" className="text-sm font-medium w-24">Value (ETH)</label>
            <input
              className={inputClassNames} type="number" autoComplete="off"
              name="etherValue" defaultValue={formData['etherValue']}
              onChange={(e) => onChange('etherValue', e.target.value)}
            />
          </div>
          <div className="flex-1 ml-1">
            <label htmlFor="hours" className="text-sm font-medium w-24">Duration (Hours)</label>
            <input
              className={inputClassNames} type="number" autoComplete="off"
              name="hours" defaultValue={formData['hours']}
              onChange={(e) => onChange('hours', e.target.value)}
            />
          </div>
        </div>
        <div className="my-3 w-full flex flex-wrap items-center justify-start">
          <div className="flex-1 mr-1">
            <label htmlFor="category" className="text-sm font-medium w-24">Category</label>
            <select
              className={inputClassNames}
              name="category" defaultValue={formData['category']}
              onChange={(e) => onChange('category', e.target.value)}
            >
              {!formData['category'] && <option value=""></option>}
              <option value="Web3">Web3</option>
              <option value="DAO">DAO</option>
              <option value="Startup">Startup</option>
              <option value="Lessons">Lessons</option>
              <option value="Business">Business</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Community Operations">Community Operations</option>
              <option value="Programming & Tech">Programming & Tech</option>
              <option value="Graphics & Design">Graphics & Design</option>
              <option value="Music & Audio">Music & Audio</option>
              <option value="Video & Animation">Video & Animation</option>
              <option value="Writing & Translation">Writing & Translation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex-1 ml-1">
            <label htmlFor="method" className="text-sm font-medium w-24">Method</label>
            <select
              className={inputClassNames}
              name="method" defaultValue={formData['method']}
              onChange={(e) => onChange('method', e.target.value)}
            >
              {!formData['method'] && <option value=""></option>}
              <option value="Online">Online</option>
              <option value="Mobile-Call">Mobile-Call</option>
              <option value="Catchup">Catchup</option>
            </select>
          </div>
        </div>
        <div className="my-3 w-full flex flex-wrap items-center justify-start">
          <div className="flex-1 mr-1">
            <label htmlFor="availabilityFrom" className="text-sm font-medium w-24">Availability From</label>
            <input
              className={inputClassNames} type="date"
              name="availabilityFrom" defaultValue={formData['availabilityFrom']}
              onChange={(e) => onChange('availabilityFrom', e.target.value)}
            />
          </div>
          <div className="flex-1 ml-1">
            <label htmlFor="availabilityTo" className="text-sm font-medium w-24">Availability To</label>
            <input
              className={inputClassNames} type="date"
              name="availabilityTo" defaultValue={formData['availabilityTo']}
              onChange={(e) => onChange('availabilityTo', e.target.value)}
            />
          </div>
        </div>
        <div className="my-3 w-full">
          <label htmlFor="description" className="text-sm font-medium w-24">Description</label>
          <textarea
            className={inputClassNames} rows={3} autoComplete="off"
            name="description" defaultValue={formData['description']}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </div>
      </section>
      <div className="mt-4 flex items-center justify-end">
        <button
          type="button" onClick={() => onCancel()}
          className={clsx(
            "w-24 rounded-md leading-6 py-1 px-4 text-sm text-neutral-900 shadow-sm",
            "bg-white/90 hover:bg-white/80 mr-4",
            "border border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
          )}
        >Cancel</button>
        <button
          type="submit"
          className={clsx(
            "w-24 flex items-center justify-center rounded-md leading-6 py-1 px-4 text-sm text-white shadow-sm",
            "bg-neutral-900 hover:bg-neutral-800",
            "border border-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
          )}
        >Save</button>
      </div>
    </form>
  )
}
