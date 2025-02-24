import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

declare global {
  type TypedSupabaseClient = SupabaseClient<Database>
}

export {} 