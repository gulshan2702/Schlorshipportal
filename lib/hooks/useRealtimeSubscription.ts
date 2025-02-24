import { useEffect } from 'react'
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/config'

export function useRealtimeSubscription<T>(
  table: string,
  callback: (payload: T) => void,
  filter?: { field: string; value: string }
) {
  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      // Enable Realtime for the table
      await supabase.channel('custom-all-channel').subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to', table)
        }
      })

      // Create subscription
      let subscription = supabase
        .channel('custom-filter-channel')
        .on(
          'postgres_changes' as any,
          {
            event: '*',
            schema: 'public',
            table: table,
            ...(filter && { filter: `${filter.field}=eq.${filter.value}` }),
          },
          (payload: { new: T }) => {
            callback(payload.new as T)
          }
        )
        .subscribe()

      channel = subscription
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, callback, filter])
} 