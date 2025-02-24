import { Database } from './supabase'

export type AuthUser = Database['public']['Tables']['auth']['Row']

export interface AuthSession {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
} 