'use client'

import { useRef } from 'react'
import { Paperclip } from 'lucide-react'

interface Props {
  onUpload: (file: File) => void
}

export default function UploadButton({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      e.target.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,.docx"
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Enviar documento"
        className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </>
  )
}