"use client"
import * as React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { fetchProfile, updateProfile, uploadAvatar, setAvatar, changePassword, getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification, getInvoices, getOrders, deleteAccount as deleteAccountApi, type NotificationItem, type InvoiceItem, type OrderItem } from '@/services/profile.service'
import type { AuthUser } from '@/types/auth'
import useSWR from 'swr'

export function useProfile() {
  const { user, refreshProfile } = useAuth()
  const { push } = useToast()

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [avatar, setAvatarUrl] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [country, setCountry] = React.useState('')
  const [userState, setUserState] = React.useState('')
  const [city, setCity] = React.useState('')
  const [createdAt, setCreatedAt] = React.useState<string | undefined>(undefined)

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([])
  const [orders, setOrders] = React.useState<OrderItem[]>([])
  const [loadingTab, setLoadingTab] = React.useState<string | undefined>(undefined)

  const {
    data: profileData,
    error,
    isLoading,
    mutate,
  } = useSWR(user ? "/profile" : null, fetchProfile)

  React.useEffect(() => {
    if (profileData?.data) {
      const u = profileData.data as (AuthUser & { phone?: string; bio?: string; country?: string; state?: string; city?: string; createdAt?: string })
      setFirstName(u.firstName || '')
      setLastName(u.lastName || '')
      setEmail(u.email || '')
      setPhone(u.phone || '')
      setBio(u.bio || '')
      setAvatarUrl(u.avatar || null)
      setCountry(u.country || '')
      setUserState(u.state || '')
      setCity(u.city || '')
      setCreatedAt(u.createdAt)
    }
  }, [profileData])

  const save = React.useCallback(async () => {
    if (!user) return
    setSaving(true)
    try {
      const res = await updateProfile(user.id, { firstName, lastName, email, bio, phone, country, state: userState, city })
      if (res.success) {
        push({ message: 'Profile saved', type: 'success' })
        await refreshProfile()
        mutate()
      } else {
        push({ message: res.error || 'Failed to update profile', type: 'error' })
      }
    } finally {
      setSaving(false)
    }
  }, [user, firstName, lastName, email, bio, phone, country, userState, city, refreshProfile, mutate, push])

  const changeAvatar = React.useCallback(
    async (file: File) => {
      if (!user) return
      try {
        const uploadResult = await uploadAvatar(file, (p: number) => setUploadProgress(p))
        if (uploadResult.success && uploadResult.url) {
          const res = await setAvatar(user.id, uploadResult.url)
          if (res.success) {
            setAvatarUrl(uploadResult.url)
            push({ message: 'Avatar updated', type: 'success' })
            await refreshProfile()
            mutate()
          } else {
            push({ message: res.error || 'Failed to set avatar', type: 'error' })
          }
        } else {
          push({ message: uploadResult.error || 'Failed to upload avatar', type: 'error' })
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to upload avatar'
        push({ message: msg, type: 'error' })
      }
    },
    [user, refreshProfile, mutate, push]
  )

  const updatePassword = React.useCallback(
    async (current: string, next: string) => {
      if (!user) return
      try {
        const res = await changePassword(user.id, current, next)
        if (res.success) {
          push({ message: 'Password updated', type: 'success' })
        } else {
          push({ message: res.error || 'Failed to update password', type: 'error' })
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update password'
        push({ message: msg, type: 'error' })
      }
    },
    [user, push]
  )

  const loadNotifications = React.useCallback(async () => {
    setLoadingTab('Notifications')
    try {
      const [notifs, unread] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ])
      if (notifs.data) {
        setNotifications(notifs.data.notifications)
      }
      if (unread.data) {
        setUnreadCount(unread.data.count)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load notifications'
      push({ message: msg, type: 'error' })
    } finally {
      setLoadingTab(undefined)
    }
  }, [push])

  const markRead = React.useCallback(
    async (id: string) => {
      try {
        await markNotificationRead(id)
        loadNotifications()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to mark notification as read'
        push({ message: msg, type: 'error' })
      }
    },
    [loadNotifications, push]
  )

  const markAllRead = React.useCallback(async () => {
    try {
      await markAllNotificationsRead()
      loadNotifications()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to mark all notifications as read'
      push({ message: msg, type: 'error' })
    }
  }, [loadNotifications, push])

  const removeNotification = React.useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id)
        loadNotifications()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete notification'
        push({ message: msg, type: 'error' })
      }
    },
    [loadNotifications, push]
  )

  const loadBilling = React.useCallback(async () => {
    setLoadingTab('Billing')
    try {
      const [invoicesData, ordersData] = await Promise.all([
        getInvoices(),
        getOrders(),
      ])
      if (invoicesData.data) {
        setInvoices(invoicesData.data.invoices)
      }
      if (ordersData.data) {
        setOrders(ordersData.data.orders)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load billing'
      push({ message: msg, type: 'error' })
    } finally {
      setLoadingTab(undefined)
    }
  }, [push])

  const deleteAccount = React.useCallback(async () => {
    try {
      await deleteAccountApi()
      push({ message: 'Account deleted', type: 'success' })
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account'
      push({ message: msg, type: 'error' })
      return false
    }
  }, [push])

  const state = {
    firstName,
    lastName,
    email,
    phone,
    bio,
    avatar,
    saving,
    uploadProgress,
    country,
    state: userState,
    city,
    createdAt,
    notifications,
    unreadCount,
    invoices,
    orders,
    loadingTab,
  }

  const actions = {
    setFirstName,
    setLastName,
    setEmail,
    setPhone,
    setBio,
    setCountry,
    setState: setUserState,
    setCity,
    save,
    changeAvatar,
    updatePassword,
    loadNotifications,
    markRead,
    markAllRead,
    removeNotification,
    loadBilling,
    deleteAccount,
  }

  return { state, actions, isLoading, error }
}
