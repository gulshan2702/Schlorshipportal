import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Simple fallback embedding function using basic text hashing
function generateFallbackEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0)
  const normalized = text.toLowerCase().trim()
  
  // Generate a simple hash-based embedding (this is a temporary solution)
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i)
    embedding[i % 1536] = (charCode / 255) * 2 - 1
  }
  
  return embedding
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      })
      return NextResponse.json({ embedding: response.data[0].embedding })
    } catch (openaiError: any) {
      // If we hit rate limits or quota issues, use fallback
      if (openaiError.status === 429) {
        console.warn('Using fallback embedding due to OpenAI rate limit:', openaiError.message)
        const fallbackEmbedding = generateFallbackEmbedding(text)
        return NextResponse.json({ 
          embedding: fallbackEmbedding,
          warning: 'Using fallback embedding due to API limitations'
        })
      }
      throw openaiError
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    )
  }
} 