'use client'

import { getUser, useAuthStore } from '@/lib/stores/auth'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

function AuthUserMiddleware({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        await getUser()
      } catch (error) {
        // Silently ignore authentication errors
        console.error('Auth error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUser()
  }, [pathname])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    )
  }
  
  return children
}

export default AuthUserMiddleware