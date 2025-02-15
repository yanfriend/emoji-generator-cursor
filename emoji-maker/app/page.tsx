'use client'

import { EmojiForm } from '@/components/emoji-form'
import { EmojiGrid } from '@/components/emoji-grid'
import { useState, useEffect, useRef } from 'react'

interface Emoji {
  id: string
  url: string | null
  likes: number
  prompt: string
  blob?: Blob
  isLiked: boolean
}

export default function Home() {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true)
    const placeholderId = Date.now().toString()
    
    // Add placeholder while loading
    setEmojis(prev => [{
      id: placeholderId,
      url: null,
      likes: 0,
      prompt,
      isLiked: false,
      blob: undefined
    }, ...prev])

    try {
      console.log('🚀 Making request to /api/generate with prompt:', prompt)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      // Get the image blob
      const imageBlob = await response.blob()
      
      // Create a URL for the blob
      const url = URL.createObjectURL(imageBlob)

      // Update the placeholder with the real emoji URL
      setEmojis(prev => prev.map(emoji => 
        emoji.id === placeholderId 
          ? { ...emoji, url, blob: imageBlob }
          : emoji
      ))

    } catch (error) {
      console.error('Failed to generate emoji:', error)
      setEmojis(prev => prev.filter(emoji => emoji.id !== placeholderId))
      alert(error instanceof Error ? error.message : 'Failed to generate emoji')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (id: string) => {
    setEmojis(prev =>
      prev.map(emoji =>
        emoji.id === id 
          ? { 
              ...emoji, 
              isLiked: !emoji.isLiked,
              likes: emoji.isLiked ? emoji.likes - 1 : emoji.likes + 1 
            }
          : emoji
      )
    )
  }

  const handleDownload = async (url: string, prompt: string, emoji: Emoji) => {
    try {
      // Use the stored blob if available
      const blob = emoji.blob || await (await fetch(url)).blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `emoji-${prompt.replace(/\s+/g, '-')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the temporary download URL
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Failed to download emoji:', error)
      alert('Failed to download emoji')
    }
  }

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      emojis.forEach(emoji => {
        if (emoji.url && emoji.url.startsWith('blob:')) {
          URL.revokeObjectURL(emoji.url)
        }
      })
    }
  }, [emojis])

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Emoji Generator</h1>
          <p className="text-muted-foreground">
            Generate custom emojis using AI. Just describe what you want!
          </p>
        </div>
        
        <div className="flex justify-center">
          <EmojiForm onSubmit={handleSubmit} />
        </div>

        <EmojiGrid 
          emojis={emojis}
          onLike={handleLike}
          onDownload={(url, prompt, emoji) => handleDownload(url, prompt, emoji)}
        />
      </main>
    </div>
  )
}
