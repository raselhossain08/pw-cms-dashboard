import type { DashboardData, DashboardStats, Series, AiUsage } from "@/lib/types/dashboard"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getStats(): Promise<DashboardStats> {
  await delay(100)
  return {
    students: { label: "Total Students", value: 2847, trendLabel: "from last month", trendDelta: 12 },
    courses: { label: "Active Courses", value: 127, trendLabel: "from last month", trendDelta: 8 },
    revenue: { label: "Monthly Revenue", value: "$84,329", trendLabel: "from last month", trendDelta: 24 },
    aiConversations: { label: "AI Conversations", value: 1247, trendLabel: "from last week", trendDelta: 45 },
  }
}

export async function getEnrollmentsSeries(): Promise<Series> {
  await delay(100)
  return {
    x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    y: [150, 230, 180, 320, 290, 380],
  }
}

export async function getRevenueSeries(): Promise<Series> {
  await delay(100)
  return {
    x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    y: [45000, 52000, 48000, 61000, 73000, 84000],
  }
}

export async function getAiUsage(): Promise<AiUsage> {
  await delay(100)
  return {
    labels: ["Course Recommendations", "Q&A Support", "Assessment Help", "General Queries"],
    values: [35, 28, 22, 15],
  }
}

export async function getCompletionSeries(): Promise<Series> {
  await delay(100)
  return {
    x: ["Week 1", "Week 2", "Week 3", "Week 4"],
    y: [78, 82, 85, 88],
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    stats,
    enrollments,
    revenue,
    aiUsage,
    completion,
  ] = await Promise.all([
    getStats(),
    getEnrollmentsSeries(),
    getRevenueSeries(),
    getAiUsage(),
    getCompletionSeries(),
  ])

  const aircraftInquiries: Series = {
    x: ["Cessna 172", "Piper PA-28", "Cirrus SR22", "Diamond DA40"],
    y: [24, 18, 12, 9],
  }

  const aiPerformance: Series = {
    x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    y: [78, 81, 79, 84, 86, 83, 85],
  }

  const progress: AiUsage = {
    labels: ["Completed", "In Progress", "Not Started"],
    values: [62, 28, 10],
  }

  const traffic = {
    categories: ["Direct", "Referral", "Social", "Organic"],
    series: [
      { name: "Visits", values: [4200, 2100, 1800, 3500] },
      { name: "Signups", values: [320, 140, 120, 260] },
    ],
  }

  return {
    stats,
    enrollments,
    revenue,
    aiUsage,
    completion,
    aircraftInquiries,
    aiPerformance,
    progress,
    traffic,
  }
}
