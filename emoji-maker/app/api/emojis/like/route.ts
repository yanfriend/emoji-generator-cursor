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

    const { error } = await supabase
      .from('emojis')
      .update({ 
        likes_count: isLiked ? 'likes_count - 1' : 'likes_count + 1' 
      })
      .eq('id', emojiId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating like:', error)
    return NextResponse.json(
      { error: 'Failed to update like' },
      { status: 500 }
    )
  }
} 