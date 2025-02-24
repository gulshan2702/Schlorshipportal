export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type EligibilityCriteria = {
  caste?: string[]
  religion?: string[]
  state?: string
  type?: string[]
  institutionType?: string[]
  minGrade?: number
  maxIncome?: number
  gpa_requirement?: string
  education_level?: string[]
  major_restrictions?: string[]
  other_requirements?: string[]
}

export interface Database {
  public: {
    Tables: {
      scholarships: {
        Row: {
          id: string
          title: string
          description: string
          amount: number
          deadline: string
          category: string
          status: 'Available' | 'Limited' | 'New' | 'Closing Soon'
          eligibility_criteria: EligibilityCriteria
          requirements: string[]
          created_at: string
          updated_at: string
          vector_embedding: number[] | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          amount: number
          deadline: string
          category: string
          status?: 'Available' | 'Limited' | 'New' | 'Closing Soon'
          eligibility_criteria?: EligibilityCriteria
          requirements?: string[]
          created_at?: string
          updated_at?: string
          vector_embedding?: number[] | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          amount?: number
          deadline?: string
          category?: string
          status?: 'Available' | 'Limited' | 'New' | 'Closing Soon'
          eligibility_criteria?: EligibilityCriteria
          requirements?: string[]
          created_at?: string
          updated_at?: string
          vector_embedding?: number[] | null
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          scholarship_id: string
          status: 'Pending' | 'Approved' | 'Rejected'
          submitted_at: string
          documents: {
            type: string
            url: string
          }[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scholarship_id: string
          status?: 'Pending' | 'Approved' | 'Rejected'
          submitted_at?: string
          documents?: {
            type: string
            url: string
          }[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scholarship_id?: string
          status?: 'Pending' | 'Approved' | 'Rejected'
          submitted_at?: string
          documents?: {
            type: string
            url: string
          }[]
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          caste: string | null
          religion: string | null
          state: string | null
          education: {
            level: string
            institution: string
            grade: number
          } | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          caste?: string | null
          religion?: string | null
          state?: string | null
          education?: {
            level: string
            institution: string
            grade: number
          } | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          caste?: string | null
          religion?: string | null
          state?: string | null
          education?: {
            level: string
            institution: string
            grade: number
          } | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_scholarships: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          title: string
          match_score: number
        }[]
      }
      search_scholarships: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          title: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 