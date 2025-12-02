export type StatCard = {
  label: string
  value: number | string
  trendLabel: string
  trendDelta: number
}

export type DashboardStats = {
  students: StatCard
  courses: StatCard
  revenue: StatCard
  aiConversations: StatCard
}

export type Series = {
  x: string[]
  y: number[]
}

export type AiUsage = {
  labels: string[]
  values: number[]
}

export type DashboardData = {
  stats: DashboardStats
  enrollments: Series
  revenue: Series
  aiUsage: AiUsage
  completion: Series
  aircraftInquiries: Series
  aiPerformance: Series
  progress: AiUsage
  traffic: {
    categories: string[]
    series: { name: string; values: number[] }[]
  }
}
