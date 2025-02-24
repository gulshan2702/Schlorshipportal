'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  User, 
  BarChart,
  GraduationCap,
  SlidersHorizontal,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase/config'
import { userService } from '@/lib/services/user.service'
import { toast } from 'sonner'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Scholarships', href: '/scholarships', icon: GraduationCap },
  { name: 'Filter Scholarships', href: '/filter-scholarships', icon: SlidersHorizontal },
  { name: 'Matches', href: '/matches', icon: Search },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Analytics', href: '/analytics', icon: BarChart },
]

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('Loading...')

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    const user = await userService.getCurrentUser()
    if (user) {
      setUserName(user.full_name)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 shrink-0 items-center px-6">
            <h1 className="text-xl font-semibold text-gray-900">Scholarship Matcher</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{userName}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-10">
          <div className="px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout 