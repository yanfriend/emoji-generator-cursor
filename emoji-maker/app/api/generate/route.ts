import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(req: Request) {
  console.log('🎯 POST /api/generate endpoint hit')

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('REPLICATE_API_TOKEN is not set')
    return NextResponse.json(
      { error: 'Replicate API token not configured' },
      { status: 500 }
    )
  }

  try {
    const { prompt } = await req.json()
    console.log('Received prompt:', prompt)

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

    console.log('Calling Replicate with input:', input)

    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      { input }
    )

    // Get the first image data from the output
    const entries = Object.entries(output)
    if (entries.length === 0) {
      throw new Error('No image data received from Replicate')
    }

    const [_, imageData] = entries[0]
    if (!imageData) {
      throw new Error('Invalid image data received')
    }

    // Return the raw image data
    return new Response(imageData, {
      headers: {
        'Content-Type': 'image/png'
      }
    })

  } catch (error) {
    console.error('Error generating emoji:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate emoji' },
      { status: 500 }
    )
  }
} 