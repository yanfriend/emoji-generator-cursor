'use client'

import Image from 'next/image'
import { Download, Heart, ImageIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Emoji {
  id: string
  url: string | null
  likes: number
  prompt: string
  blob?: Blob
  isLiked: boolean
  image_url: string
}

interface EmojiGridProps {
  emojis: Emoji[]
  onLike: (id: string) => Promise<void>
  onDownload: (url: string | null, prompt: string, emoji: Emoji) => Promise<void>
}

export function EmojiGrid({ emojis, onLike, onDownload }: EmojiGridProps) {
  console.log('🎨 Rendering EmojiGrid with emojis:', emojis)

  if (emojis.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-3" />
        <p className="text-muted-foreground">
          No emojis generated yet. Try creating one!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {emojis.map((emoji) => {
        console.log('🎯 Rendering emoji:', emoji)
        return (
          <div key={emoji.id} className="relative group aspect-square">
            <div className="w-full h-full rounded-lg overflow-hidden">
              {!emoji.url ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={emoji.url}
                    alt={emoji.prompt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              )}
            </div>
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onLike(emoji.id)}
                  className={cn(
                    "text-white hover:text-white hover:bg-white/20",
                    emoji.isLiked && "text-red-500 hover:text-red-500"
                  )}
                >
                  <Heart 
                    className={cn(
                      "h-5 w-5 transition-all",
                      emoji.isLiked && "fill-current scale-110"
                    )} 
                  />
                </Button>
                <span className="text-white text-xs font-medium">
                  {emoji.likes ?? 0}
                </span>
              </div>

              {emoji.url && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => emoji.url && onDownload(emoji.url, emoji.prompt, emoji)}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <Download className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
} 