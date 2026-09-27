import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { Client } from '@gradio/client'
import { supabaseAdmin } from '@/lib/supabase'

// Raise on Vercel Pro/Enterprise if ZeroGPU cold-starts exceed this.
export const maxDuration = 60

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let prompt: string
  try {
    const body = await req.json()
    prompt = body.prompt
    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 })
  }

  let generatedText: string
  try {
    if (!process.env.HF_SPACE_ID) {
      throw new Error('HF_SPACE_ID not configured')
    }

    const client = await Client.connect(process.env.HF_SPACE_ID, {
      hf_token: process.env.HF_TOKEN as `hf_${string}` | undefined,
    })

    // TODO once the Space is live: run client.view_api() (or open
    // https://huggingface.co/spaces/<space>?view=api) and confirm:
    //   1. api_name matches HF_API_NAME below
    //   2. parameter keys/order match your Gradio fn signature exactly
    const apiName = process.env.HF_API_NAME || '/predict'
    const result = await client.predict(apiName, {
      prompt: prompt,
    })

    const data = result.data as unknown[]
    if (!data || typeof data[0] !== 'string') {
      throw new Error('Unexpected response shape from Gradio Space — verify api schema')
    }
    generatedText = data[0]
  } catch (err) {
    console.error('Gradio inference error:', err)
    return NextResponse.json(
      {
        error:
          'Model inference failed. If the Space was just deployed, it may still be cold-starting, or the API schema may not match yet.',
      },
      { status: 502 }
    )
  }

  const { error: dbError } = await supabaseAdmin
    .from('generations')
    .insert({ user_id: userId, prompt, generated_text: generatedText })

  if (dbError) {
    // Don't fail the user-facing response over a logging failure, but don't hide it either.
    console.error('Supabase insert error:', dbError)
  }

  return NextResponse.json({ generatedText })
}
