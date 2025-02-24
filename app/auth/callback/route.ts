import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('Auth callback started')
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      console.error('No code provided')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore,
    })
    
    console.log('Exchanging code for session')
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError || !session) {
      console.error('Session exchange error:', exchangeError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('Session established:', session.user.id)
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/dashboard', request.url))

    // Set cookie max age to match session
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    })

    console.log('Cookies after setting session:', cookieStore.getAll())
    
    return response
  } catch (e) {
    console.error('Auth callback error:', e)
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 