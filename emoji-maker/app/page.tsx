'use client'

import { useUser } from '@clerk/nextjs'
import { EmojiForm } from '@/components/emoji-form'
import { EmojiGrid } from '@/components/emoji-grid'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Emoji {
  id: string
  url: string | null
  likes: number
  prompt: string
  blob?: Blob
  isLiked: boolean
  image_url: string  // Add this for Supabase stored URL
}

export default function Home() {
  const { isSignedIn, user } = useUser()
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch emojis on component mount
  useEffect(() => {
    async function fetchEmojis() {
      const { data, error } = await supabase
        .from('emojis')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching emojis:', error)
        return
      }

      if (data) {
        setEmojis(data.map(emoji => ({
          ...emoji,
          url: emoji.image_url,
          isLiked: false,
          likes: emoji.likes_count || 0  // Ensure likes is a number
        })))
      }
    }

    if (isClient) {
      fetchEmojis()
    }
  }, [isClient])

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
      blob: undefined,
      image_url: ''
    }, ...prev])

    try {
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

  const handleDownload = async (url: string | null, prompt: string, emoji: Emoji) => {
    if (!url) return;
    
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

  // Only render content on client
  if (!isClient) return null

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Emoji Generator</h1>
          <p className="text-muted-foreground">
            Generate custom emojis using AI. Just describe what you want!
          </p>
        </div>
        
        {isSignedIn ? (
          <>
            <div className="flex justify-center">
              <EmojiForm onSubmit={handleSubmit} />
            </div>

            <EmojiGrid 
              emojis={emojis}
              onLike={handleLike}
              onDownload={handleDownload}
            />
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              Please sign in to generate and manage emojis.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
