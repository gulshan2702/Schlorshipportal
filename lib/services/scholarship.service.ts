import { supabase } from '@/lib/supabase/config'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'
import { embeddingsService } from './embeddings.service'

type Scholarship = Database['public']['Tables']['scholarships']['Row']
type ScholarshipInsert = Database['public']['Tables']['scholarships']['Insert']
type ScholarshipUpdate = Database['public']['Tables']['scholarships']['Update']
type ScholarshipFilters = {
  caste?: string[]
  type?: string[]
  state?: string
  religion?: string[]
  institutionType?: string[]
  minAmount?: number
  maxAmount?: number
  deadline?: string
  educationLevel?: string[]
  status?: string[]
}

export const scholarshipService = {
  async setupVectorSearch() {
    try {
      // Enable vector extension
      await supabase.rpc('exec_sql', {
        sql: 'create extension if not exists vector;'
      })

      // Add vector_embedding column
      await supabase.rpc('exec_sql', {
        sql: 'alter table scholarships add column if not exists vector_embedding vector(1536);'
      })

      // Create search function
      await supabase.rpc('exec_sql', {
        sql: `
          create or replace function search_scholarships (
            query_embedding vector(1536),
            match_threshold float,
            match_count int
          )
          returns table (
            id uuid,
            title text,
            description text,
            amount numeric,
            deadline timestamp,
            category text,
            status text,
            similarity float
          )
          language plpgsql
          as $$
          begin
            return query
            select
              id,
              title,
              description,
              amount,
              deadline::timestamp,
              category,
              status,
              1 - (vector_embedding <=> query_embedding) as similarity
            from scholarships
            where 1 - (vector_embedding <=> query_embedding) > match_threshold
            order by similarity desc
            limit match_count;
          end;
          $$;
        `
      })

      // Create index
      await supabase.rpc('exec_sql', {
        sql: `
          create index if not exists scholarships_vector_embedding_idx 
          on scholarships 
          using ivfflat (vector_embedding vector_cosine_ops)
          with (lists = 100);
        `
      })

      toast.success('Vector search setup completed')
      return true
    } catch (error) {
      console.error('Error setting up vector search:', error)
      toast.error('Failed to setup vector search')
      return false
    }
  },

  async getAll(): Promise<Scholarship[]> {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching scholarships:', error)
      toast.error('Failed to fetch scholarships')
      return []
    }
  },

  async getById(id: string): Promise<Scholarship | null> {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', id as string)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching scholarship:', error)
      toast.error('Failed to fetch scholarship details')
      return null
    }
  },

  async create(scholarship: ScholarshipInsert): Promise<Scholarship | null> {
    try {
      const embedding = await embeddingsService.generateEmbedding(
        `${scholarship.title} ${scholarship.description}`
      )

      const { data, error } = await supabase
        .from('scholarships')
        .insert({
          ...scholarship,
          vector_embedding: embedding,
          status: scholarship.status || 'New',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as ScholarshipInsert)
        .select()
        .single()

      if (error) throw error
      toast.success('Scholarship created successfully')
      return data
    } catch (error) {
      console.error('Error creating scholarship:', error)
      toast.error('Failed to create scholarship')
      return null
    }
  },

  async update(id: string, scholarship: ScholarshipUpdate): Promise<Scholarship | null> {
    try {
      let updateData: ScholarshipUpdate = { 
        ...scholarship,
        updated_at: new Date().toISOString()
      }

      if (scholarship.title || scholarship.description) {
        const currentScholarship = await this.getById(id)
        if (currentScholarship) {
          const embedding = await embeddingsService.generateEmbedding(
            `${scholarship.title || currentScholarship.title} ${scholarship.description || currentScholarship.description}`
          )
          updateData.vector_embedding = embedding
        }
      }

      const { data, error } = await supabase
        .from('scholarships')
        .update(updateData)
        .eq('id', id as string)
        .select()
        .single()

      if (error) throw error
      toast.success('Scholarship updated successfully')
      return data
    } catch (error) {
      console.error('Error updating scholarship:', error)
      toast.error('Failed to update scholarship')
      return null
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Scholarship deleted successfully')
      return true
    } catch (error) {
      console.error('Error deleting scholarship:', error)
      toast.error('Failed to delete scholarship')
      return false
    }
  },

  async filter(filters: ScholarshipFilters): Promise<Scholarship[]> {
    try {
      let query = supabase.from('scholarships').select('*')

      if (filters.caste?.length) {
        query = query.containedBy('eligibility_criteria->caste', filters.caste)
      }
      if (filters.type?.length) {
        query = query.containedBy('eligibility_criteria->type', filters.type)
      }
      if (filters.religion?.length) {
        query = query.containedBy('eligibility_criteria->religion', filters.religion)
      }
      if (filters.institutionType?.length) {
        query = query.containedBy('eligibility_criteria->institutionType', filters.institutionType)
      }
      if (filters.state && filters.state !== 'All States') {
        query = query.eq('eligibility_criteria->state', filters.state)
      }
      if (filters.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount)
      }
      if (filters.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount)
      }
      if (filters.deadline) {
        query = query.lte('deadline', filters.deadline)
      }
      if (filters.educationLevel?.length) {
        query = query.containedBy('eligibility_criteria->education_level', filters.educationLevel)
      }
      if (filters.status?.length) {
        query = query.in('status', filters.status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error filtering scholarships:', error)
      toast.error('Failed to filter scholarships')
      return []
    }
  },

  async search(query: string): Promise<Scholarship[]> {
    try {
      const embedding = await embeddingsService.generateEmbedding(query)
      if (!embedding) return []
      
      const { data, error } = await supabase.rpc('search_scholarships', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 10
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching scholarships:', error)
      toast.error('Failed to search scholarships')
      return []
    }
  }
} 