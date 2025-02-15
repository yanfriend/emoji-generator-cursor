import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import Replicate from 'replicate'
import { supabase } from '@/lib/supabase'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function ensureUserProfile(userId: string) {
  // Check if user exists
  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('user_id', userId)
    .single()

  if (!profile) {
    // Create new user profile
    const { error } = await supabase
      .from('profiles')
      .insert([{ user_id: userId }])

    if (error) throw new Error('Failed to create user profile')
  }
}

export async function POST(req: NextRequest) {
  console.log('🚀 Starting POST request')
  
  const { userId } = getAuth(req)
  console.log('👤 User ID:', userId)
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Ensure user has a profile
  try {
    console.log('🔍 Checking user profile...')
    await ensureUserProfile(userId)
    console.log('✅ User profile checked')
  } catch (error) {
    console.error('❌ Profile error:', error)
    return NextResponse.json(
      { error: 'Failed to process user profile' },
      { status: 500 }
    )
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: 'Replicate API token not configured' },
      { status: 500 }
    )
  }

  try {
    const { prompt } = await req.json()
    console.log('📝 Received prompt:', prompt)

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const input = {
      prompt: `A TOK emoji of ${prompt}`,
      apply_watermark: false
    }

    console.log('🎨 Calling Replicate...')
    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      { input }
    )
    console.log('✅ Replicate response received')

    const entries = Object.entries(output)
    if (entries.length === 0) {
      throw new Error('No image data received from Replicate')
    }

    const [_, imageData] = entries[0]
    console.log('🖼️ Image URL received:', imageData)

    // Fetch the image data as a blob
    console.log('📥 Fetching image data...')
    const response = await fetch(imageData as string)
    const blob = await response.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())
    const filename = `${Date.now()}.png`
    console.log('✅ Image data fetched, filename:', filename)

    // Upload to Supabase Storage
    console.log('📤 Uploading to Supabase...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Upload error details:', uploadError)
      console.error('Upload error full object:', JSON.stringify(uploadError, null, 2))
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }
    console.log('✅ Upload successful:', uploadData)

    // Get the public URL
    console.log('🔗 Getting public URL...')
    const { data: publicUrl } = supabase.storage
      .from('emojis')
      .getPublicUrl(filename)
    console.log('✅ Public URL:', publicUrl)

    // Create record in emojis table
    console.log('💾 Saving to database...')
    const { error: dbError } = await supabase
      .from('emojis')
      .insert([{
        image_url: publicUrl.publicUrl,
        prompt,
        creator_user_id: userId
      }])

    if (dbError) {
      console.error('❌ Database error:', dbError)
      throw new Error(`Failed to save emoji: ${dbError.message}`)
    }
    console.log('✅ Database record created')

    // Return the image data for immediate display
    console.log('🏁 Request completed successfully')
    return new Response(imageData, {
      headers: {
        'Content-Type': 'image/png'
      }
    })

  } catch (error) {
    console.error('❌ Error generating emoji:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate emoji' },
      { status: 500 }
    )
  }
} 