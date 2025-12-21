"use client"
import * as React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { fetchProfile, updateProfile, uploadAvatar, setAvatar, changePassword, getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification, getInvoices, getOrders, deleteAccount as deleteAccountApi, resendVerificationEmail, getEmailVerificationStatus, getUserSessions, deleteSession, deleteAllSessions, getNotificationPreferences, updateNotificationPreferences, getPrivacySettings, updatePrivacySettings, downloadInvoice, downloadOrder, getProfileStats, type NotificationItem, type InvoiceItem, type OrderItem, type SessionItem, type NotificationPreferences, type PrivacySettings, type ProfileStats } from '@/services/profile.service'
import type { AuthUser } from '@/types/auth'
import useSWR from 'swr'
import { validateEmail, validatePhone, validatePassword, calculateProfileCompletion } from '@/lib/validation'

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

  // Email verification
  const [emailVerified, setEmailVerified] = React.useState(false)
  const [resendingVerification, setResendingVerification] = React.useState(false)

  // Sessions
  const [sessions, setSessions] = React.useState<SessionItem[]>([])

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = React.useState<NotificationPreferences>({})

  // Privacy settings
  const [privacySettings, setPrivacySettings] = React.useState<PrivacySettings>({})

  // Profile stats
  const [profileStats, setProfileStats] = React.useState<ProfileStats>({})

  // Validation errors
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({})

  // Profile completion
  const [profileCompletion, setProfileCompletion] = React.useState({ percentage: 0, missing: [] as string[] })

  const {
    data: profileData,
    error,
    isLoading,
    mutate,
  } = useSWR(user ? "/profile" : null, fetchProfile)

  React.useEffect(() => {
    if (profileData?.data) {
      const u = profileData.data as (AuthUser & { phone?: string; bio?: string; country?: string; state?: string; city?: string; createdAt?: string; emailVerified?: boolean })
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
      setEmailVerified(u.emailVerified || false)

      // Calculate profile completion
      const completion = calculateProfileCompletion({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        bio: u.bio,
        avatar: u.avatar,
        country: u.country,
        state: u.state,
        city: u.city,
      })
      setProfileCompletion(completion)
    }
  }, [profileData])

  // Load email verification status
  React.useEffect(() => {
    if (user) {
      getEmailVerificationStatus().then((res) => {
        if (res.data) {
          setEmailVerified(res.data.emailVerified || false)
        }
      }).catch(() => { })
    }
  }, [user])

  // Load profile stats
  React.useEffect(() => {
    if (user) {
      getProfileStats().then((res) => {
        if (res.data) {
          setProfileStats(res.data.stats || {})
        }
      }).catch(() => { })
    }
  }, [user])

  const save = React.useCallback(async () => {
    if (!user) return

    // Validate form
    const errors: Record<string, string> = {}
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      errors.email = emailValidation.message || 'Invalid email'
    }

    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message || 'Invalid phone'
    }

    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      push({ message: 'Please fix validation errors', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const res = await updateProfile(user.id, { firstName, lastName, email, bio, phone, country, state: userState, city })
      if (res.success) {
        push({ message: 'Profile saved', type: 'success' })
        await refreshProfile()
        mutate()
        setValidationErrors({})
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
      if (notifs.success && notifs.data) {
        // Handle different response structures
        const notificationsList = Array.isArray(notifs.data.notifications)
          ? notifs.data.notifications
          : Array.isArray(notifs.data)
            ? notifs.data
            : []
        // Map and normalize notification data
        const normalizedNotifications = notificationsList.map((n: any) => {
          // Handle MongoDB ObjectId or string ID
          const id = n._id ? (typeof n._id === 'object' ? String(n._id) : n._id) : (n.id || String(Math.random()))

          // Handle date - MongoDB dates are Date objects, convert to ISO string
          let createdAt = n.createdAt
          if (createdAt && typeof createdAt === 'object' && createdAt.toISOString) {
            createdAt = createdAt.toISOString()
          } else if (!createdAt || typeof createdAt !== 'string') {
            createdAt = new Date().toISOString()
          }

          return {
            _id: String(id),
            title: n.title || n.subject || 'Notification',
            message: n.message || n.body || n.content || '',
            isRead: n.isRead !== undefined ? Boolean(n.isRead) : false,
            createdAt: createdAt,
          }
        })
        setNotifications(normalizedNotifications)
      }
      if (unread.success && unread.data) {
        let count = 0
        if (typeof unread.data === 'object' && unread.data !== null && 'count' in unread.data) {
          count = Number((unread.data as { count: number }).count) || 0
        } else if (typeof unread.data === 'number') {
          count = unread.data
        }
        setUnreadCount(count)
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

  // Email verification
  const resendVerification = React.useCallback(async () => {
    setResendingVerification(true)
    try {
      const res = await resendVerificationEmail()
      if (res.success) {
        push({ message: 'Verification email sent', type: 'success' })
      } else {
        push({ message: res.error || 'Failed to send verification email', type: 'error' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send verification email'
      push({ message: msg, type: 'error' })
    } finally {
      setResendingVerification(false)
    }
  }, [push])

  // Sessions
  const loadSessions = React.useCallback(async () => {
    try {
      const res = await getUserSessions()
      if (res.data) {
        setSessions(res.data.sessions || [])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load sessions'
      push({ message: msg, type: 'error' })
    }
  }, [push])

  const removeSession = React.useCallback(async (sessionId: string) => {
    try {
      await deleteSession(sessionId)
      push({ message: 'Session removed', type: 'success' })
      loadSessions()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove session'
      push({ message: msg, type: 'error' })
    }
  }, [loadSessions, push])

  const removeAllSessions = React.useCallback(async () => {
    try {
      await deleteAllSessions()
      push({ message: 'All sessions removed', type: 'success' })
      loadSessions()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove sessions'
      push({ message: msg, type: 'error' })
    }
  }, [loadSessions, push])

  // Notification preferences
  const loadNotificationPreferences = React.useCallback(async () => {
    try {
      const res = await getNotificationPreferences()
      if (res.data) {
        setNotificationPrefs(res.data.preferences || {})
      }
    } catch (err: unknown) {
      // Silently fail - preferences might not exist yet
    }
  }, [])

  const saveNotificationPreferences = React.useCallback(async () => {
    try {
      const res = await updateNotificationPreferences(notificationPrefs)
      if (res.success) {
        push({ message: 'Notification preferences saved', type: 'success' })
      } else {
        push({ message: res.error || 'Failed to save preferences', type: 'error' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save preferences'
      push({ message: msg, type: 'error' })
    }
  }, [notificationPrefs, push])

  // Privacy settings
  const loadPrivacySettings = React.useCallback(async () => {
    try {
      const res = await getPrivacySettings()
      if (res.data) {
        setPrivacySettings(res.data.settings || {})
      }
    } catch (err: unknown) {
      // Silently fail - settings might not exist yet
    }
  }, [])

  const savePrivacySettings = React.useCallback(async () => {
    try {
      const res = await updatePrivacySettings(privacySettings)
      if (res.success) {
        push({ message: 'Privacy settings saved', type: 'success' })
      } else {
        push({ message: res.error || 'Failed to save settings', type: 'error' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings'
      push({ message: msg, type: 'error' })
    }
  }, [privacySettings, push])

  // Download invoice/order
  const downloadInvoiceFile = React.useCallback(async (invoiceId: string) => {
    try {
      const res = await downloadInvoice(invoiceId)
      if (res.data?.url) {
        window.open(res.data.url, '_blank')
        push({ message: 'Invoice downloaded', type: 'success' })
      } else {
        push({ message: 'Failed to download invoice', type: 'error' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to download invoice'
      push({ message: msg, type: 'error' })
    }
  }, [push])

  const downloadOrderFile = React.useCallback(async (orderId: string) => {
    try {
      const res = await downloadOrder(orderId)
      if (res.data?.url) {
        window.open(res.data.url, '_blank')
        push({ message: 'Order downloaded', type: 'success' })
      } else {
        push({ message: 'Failed to download order', type: 'error' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to download order'
      push({ message: msg, type: 'error' })
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
    emailVerified,
    resendingVerification,
    sessions,
    notificationPrefs,
    privacySettings,
    profileStats,
    validationErrors,
    profileCompletion,
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
    resendVerification,
    loadSessions,
    removeSession,
    removeAllSessions,
    setNotificationPrefs: setNotificationPrefs,
    saveNotificationPreferences,
    loadNotificationPreferences,
    setPrivacySettings: setPrivacySettings,
    savePrivacySettings,
    loadPrivacySettings,
    downloadInvoiceFile,
    downloadOrderFile,
    validatePassword,
  }

  return { state, actions, isLoading, error }
}
