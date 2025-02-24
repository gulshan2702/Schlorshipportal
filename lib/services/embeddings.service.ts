import { supabase } from '@/lib/supabase/config'

export const embeddingsService = {
  async generateEmbedding(text: string) {
    try {
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate embedding')
      }

      const data = await response.json()
      return data.embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      return null
    }
  },

  async searchSimilar(embedding: number[], matchThreshold = 0.7, matchCount = 10) {
    try {
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error searching similar documents:', error)
      return []
    }
  }
} 