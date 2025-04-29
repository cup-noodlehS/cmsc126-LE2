'use client'

import { getUser, useAuthStore } from '@/lib/stores/auth'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

function AuthUserMiddleware({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    const fetchUser = async () => {
        setIsLoading(true)
        try {
            await getUser()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }
    if (!user) {
        fetchUser()
    }
  }, [pathname, user])

  if (isLoading) {
    return
  }
  return children
}

export default AuthUserMiddleware