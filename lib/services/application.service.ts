import { supabase } from '@/lib/supabase/config'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'

type Application = Database['public']['Tables']['applications']['Row']

export const applicationService = {
  async getAll(userId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          scholarships (
            title,
            amount,
            deadline
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
      return []
    }
  },

  async getById(id: string): Promise<Application | null> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          scholarships (
            title,
            description,
            amount,
            deadline,
            requirements
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching application:', error)
      toast.error('Failed to fetch application details')
      return null
    }
  },

  async create(application: Database['public']['Tables']['applications']['Insert']) {
    try {
      // Check if user has already applied
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', application.user_id)
        .eq('scholarship_id', application.scholarship_id)
        .single()

      if (existing) {
        toast.error('You have already applied for this scholarship')
        return null
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          ...application,
          status: 'Pending',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Application submitted successfully')
      return data
    } catch (error) {
      console.error('Error creating application:', error)
      toast.error('Failed to submit application')
      return null
    }
  },

  async update(id: string, application: Database['public']['Tables']['applications']['Update']) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update(application)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      toast.success('Application updated successfully')
      return data
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
      return null
    }
  },

  async withdraw(id: string) {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Application withdrawn successfully')
      return true
    } catch (error) {
      console.error('Error withdrawing application:', error)
      toast.error('Failed to withdraw application')
      return false
    }
  },

  async uploadDocument(file: File, userId: string, applicationId: string) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${applicationId}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
      return null
    }
  }
} 