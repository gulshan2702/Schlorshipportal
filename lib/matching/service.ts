import { supabase } from '@/lib/supabase/config'
//import { generateProfileEmbedding } from '@/lib/embeddings/utils'
import { Database } from '@/types/supabase'

type Scholarship = Database['public']['Tables']['scholarships']['Row']
type StudentProfile = Database['public']['Tables']['student_profiles']['Row']

export interface MatchResult {
  scholarship: Scholarship
  similarity: number
  matchReason: string[]
}

export class ScholarshipMatcher {
  private async getProfileEligibility(
    profile: StudentProfile,
    scholarship: Scholarship
  ): Promise<{ eligible: boolean; reasons: string[] }> {
    const profileData = profile.profile_data as any
    const criteria = scholarship.eligibility_criteria as any
    const reasons: string[] = []

    // Check GPA requirement
    if (criteria.gpa_requirement && parseFloat(profileData.gpa) < parseFloat(criteria.gpa_requirement)) {
      return { eligible: false, reasons: ['GPA requirement not met'] }
    }

    // Check education level
    if (
      criteria.education_level?.length > 0 &&
      !criteria.education_level.includes(profileData.education_level)
    ) {
      return { eligible: false, reasons: ['Education level requirement not met'] }
    }

    // Check major restrictions
    if (
      criteria.major_restrictions?.length > 0 &&
      !criteria.major_restrictions.includes(profileData.major)
    ) {
      return { eligible: false, reasons: ['Major requirement not met'] }
    }

    // Add positive matching reasons
    if (parseFloat(profileData.gpa) >= parseFloat(criteria.gpa_requirement)) {
      reasons.push('Meets GPA requirement')
    }
    if (criteria.education_level?.includes(profileData.education_level)) {
      reasons.push('Matches education level')
    }
    if (!criteria.major_restrictions?.length || criteria.major_restrictions?.includes(profileData.major)) {
      reasons.push('Matches major requirements')
    }

    return { eligible: true, reasons }
  }

  async findMatches(userId: string, limit: number = 10): Promise<MatchResult[]> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError) throw profileError
      if (!profile) throw new Error('Profile not found')

      // Get all scholarships
      const { data: scholarships, error: scholarshipsError } = await supabase
        .from('scholarships')
        .select('*')

      if (scholarshipsError) throw scholarshipsError
      if (!scholarships) return []

      // Generate embedding for current profile if not exists
      if (!profile.embedding) {
        const embedding = await generateProfileEmbedding(profile.profile_data)
        await supabase
          .from('student_profiles')
          .update({ embedding })
          .eq('id', profile.id)
        profile.embedding = embedding
      }

      // Call the similarity search function
      const { data: matches, error: matchError } = await supabase.rpc('match_scholarships', {
        student_embedding: profile.embedding,
        match_threshold: 0.7,
        match_limit: limit * 2 // Get more results to filter for eligibility
      })

      if (matchError) throw matchError

      // Filter and enhance matches with eligibility check
      const eligibleMatches: MatchResult[] = []
      for (const match of matches) {
        const scholarship = scholarships.find(s => s.id === match.id)
        if (!scholarship) continue

        const { eligible, reasons } = await this.getProfileEligibility(profile, scholarship)
        if (eligible) {
          eligibleMatches.push({
            scholarship,
            similarity: match.similarity,
            matchReason: reasons
          })
        }

        if (eligibleMatches.length >= limit) break
      }

      return eligibleMatches

    } catch (error) {
      console.error('Error in findMatches:', error)
      throw error
    }
  }
} 