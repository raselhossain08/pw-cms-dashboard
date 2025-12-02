"use client"
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
    if (!loading && user && roles && roles.length > 0 && !roles.includes(user.role)) {
      router.replace('/')
    }
  }, [user, loading, roles, router])

  if (loading) return null
  if (!user) return null
  return <>{children}</>
}
