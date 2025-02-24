import { supabase } from '@/lib/supabase/config'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'

type User = Database['public']['Tables']['users']['Row']

export const userService = {
  async createOrUpdateProfile(profile: { id: string; email: string; full_name: string }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert([{
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating/updating profile:', error)
      toast.error('Failed to update profile')
      return null
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.user) return null

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  },

  async updateProfile(userId: string, profile: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profile)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      toast.success('Profile updated successfully')
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      return null
    }
  },

  async uploadAvatar(file: File, userId: string) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      toast.success('Avatar updated successfully')
      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
      return null
    }
  },

  async getMatchingScholarships(userId: string) {
    try {
      const { data, error } = await supabase.rpc('match_scholarships', {
        user_id: userId
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching matching scholarships:', error)
      toast.error('Failed to fetch matching scholarships')
      return []
    }
  }
} 