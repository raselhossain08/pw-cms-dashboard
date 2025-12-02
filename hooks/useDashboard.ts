"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import type { DashboardData } from "@/lib/types/dashboard"
import { getDashboardData } from "@/lib/services/dashboard"

type State = {
  data?: DashboardData
  loading: boolean
  error?: string
}

export function useDashboard() {
  const [state, setState] = useState<State>({ loading: true })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: undefined }))
    try {
      const data = await getDashboardData()
      setState({ data, loading: false })
    } catch {
      setState({ loading: false, error: "Failed to load dashboard" })
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      void load()
    }, 0)
    return () => clearTimeout(t)
  }, [load])

  const stats = useMemo(() => state.data?.stats, [state.data])
  const charts = useMemo(
    () =>
      state.data
        ? {
          enrollments: state.data.enrollments,
          revenue: state.data.revenue,
          aiUsage: state.data.aiUsage,
          completion: state.data.completion,
          aircraftInquiries: state.data.aircraftInquiries,
          aiPerformance: state.data.aiPerformance,
          progress: state.data.progress,
          traffic: state.data.traffic,
        }
        : undefined,
    [state.data]
  )

  return {
    loading: state.loading,
    error: state.error,
    stats,
    charts,
    refresh: load,
  }
}
