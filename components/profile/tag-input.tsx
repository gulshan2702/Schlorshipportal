'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProfileFormData } from '@/types/profile'
import { SuggestedTags } from './suggested-tags'

interface TagInputProps {
  name: 'skills' | 'interests'
  label: string
  placeholder: string
  register: UseFormRegister<ProfileFormData>
  setValue: UseFormSetValue<ProfileFormData>
  watch: UseFormWatch<ProfileFormData>
}

const SUGGESTED_SKILLS = [
  'Programming',
  'Research',
  'Data Analysis',
  'Writing',
  'Public Speaking',
  'Leadership',
  'Project Management',
]

const SUGGESTED_INTERESTS = [
  'Machine Learning',
  'Biology',
  'Literature',
  'Computer Science',
  'Environmental Science',
  'Psychology',
  'Business',
]

export function TagInput({
  name,
  label,
  placeholder,
  register,
  setValue,
  watch,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const tags = watch(name) || []

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = () => {
    const tag = inputValue.trim()
    if (tag && !tags.includes(tag)) {
      setValue(name, [...tags, tag])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    setValue(
      name,
      tags.filter((_, i) => i !== index)
    )
  }

  const suggestedTags = name === 'skills' ? SUGGESTED_SKILLS : SUGGESTED_INTERESTS
  const unusedSuggestedTags = suggestedTags.filter(tag => !tags.includes(tag))

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div
          className="min-h-[42px] p-1.5 border rounded-md border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
              className="outline-none border-none bg-transparent flex-1 min-w-[120px] text-sm"
              placeholder={tags.length === 0 ? placeholder : ''}
            />
          </div>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Press Enter or comma to add a new {name === 'skills' ? 'skill' : 'interest'}
      </p>
      {unusedSuggestedTags.length > 0 && (
        <SuggestedTags
          tags={unusedSuggestedTags}
          onSelect={(tag) => {
            setValue(name, [...tags, tag])
          }}
        />
      )}
    </div>
  )
} 