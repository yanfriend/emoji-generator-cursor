'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Loader2 } from 'lucide-react'

interface EmojiFormProps {
  onSubmit: (prompt: string) => Promise<void>
}

export function EmojiForm({ onSubmit }: EmojiFormProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      await onSubmit(prompt)
      setPrompt('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your emoji..."
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
      </Button>
    </form>
  )
} 