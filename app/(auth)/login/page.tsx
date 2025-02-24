'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase/config'
import { userService } from '@/lib/services/user.service'

export default function Login() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      if (event === 'SIGNED_IN') {
        console.log('User signed in, creating profile')
        if (session?.user) {
          await userService.createOrUpdateProfile({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
          })
          console.log(`User profile created or updated ${session.user.id}`)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (!origin) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4F46E5',
                  brandAccent: '#4338CA',
                }
              }
            },
            style: {
              button: { background: '#4F46E5', color: 'white' },
              anchor: { color: '#4F46E5' }
            }
          }}
          providers={['google']}
          redirectTo={`${origin}/auth/callback`}
          socialLayout="horizontal"
          theme="default"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in...',
                social_provider_text: 'Sign in with {{provider}}'
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a Password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up...',
                social_provider_text: 'Sign up with {{provider}}',
                confirmation_text: 'Check your email for the confirmation link'
              }
            }
          }}
        />
      </div>
    </div>
  )
} 