export interface Database {
  public: {
    Tables: {
      student_profiles: {
        Row: {
          id: string
          user_id: string
          profile_data: any
          created_at: string
          updated_at: string
          avatar_url?: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_data?: any
          created_at?: string
          updated_at?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_data?: any
          created_at?: string
          updated_at?: string
          avatar_url?: string
        }
      }
    }
  }
} 