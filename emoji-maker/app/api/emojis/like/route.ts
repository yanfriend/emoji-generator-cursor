import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { emojiId, isLiked } = await req.json()
    console.log('Processing like:', { emojiId, isLiked })

    // Get current likes count
    const { data: currentEmoji } = await supabase
      .from('emojis')
      .select('likes_count')
      .eq('id', emojiId)
      .single()

    const currentLikes = currentEmoji?.likes_count || 0
    const newLikes = isLiked ? Math.max(currentLikes - 1, 0) : currentLikes + 1

    // Update likes count
    const { error } = await supabase
      .from('emojis')
      .update({ likes_count: newLikes })
      .eq('id', emojiId)

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({ success: true, likes: newLikes })
  } catch (error) {
    console.error('Error updating like:', error)
    return NextResponse.json(
      { error: 'Failed to update like' },
      { status: 500 }
    )
  }
} 