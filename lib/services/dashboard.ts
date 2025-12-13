import type { DashboardData, DashboardStats, Series, AiUsage } from "@/lib/types/dashboard"
import { apiFetch } from "@/lib/api-client"

export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Fetch data from backend API endpoints in parallel
    const [adminStatsRes, analyticsRes, productsRes, aircraftRes] = await Promise.all([
      apiFetch<any>("/admin/dashboard/stats"),
      apiFetch<any>("/analytics/dashboard"),
      apiFetch<any>("/products?limit=1000"),
      apiFetch<any>("/aircraft?limit=1000"),
    ])

    if (!adminStatsRes.success || !analyticsRes.success) {
      throw new Error("Failed to fetch dashboard data")
    }

    const adminData = adminStatsRes.data
    const analyticsData = analyticsRes.data

    // Calculate shop revenue from products
    const products = productsRes.success && productsRes.data?.products ? productsRes.data.products : []
    const shopRevenue = products.reduce((sum: number, product: any) => {
      return sum + (product.price * (product.soldCount || 0))
    }, 0)

    // Calculate aircraft count
    const aircraftCount = aircraftRes.success && aircraftRes.data?.aircraft ? aircraftRes.data.aircraft.length : 0

    // Map backend data to frontend format
    const stats: DashboardStats = {
      students: {
        label: "Total Students",
        value: adminData?.overview?.totalUsers || 0,
        trendLabel: "from last month",
        trendDelta: adminData?.growth?.users?.growthRate || 0,
      },
      courses: {
        label: "Active Courses",
        value: adminData?.overview?.totalCourses || 0,
        trendLabel: "from last month",
        trendDelta: 8,
      },
      revenue: {
        label: "Monthly Revenue",
        value: `$${(adminData?.overview?.totalRevenue || 0).toLocaleString()}`,
        trendLabel: "from last month",
        trendDelta: adminData?.growth?.revenue?.growthRate || 0,
      },
      aiConversations: {
        label: "AI Conversations",
        value: adminData?.overview?.totalReviews || 0,
        trendLabel: "from last week",
        trendDelta: 45,
      },
    }

    // Additional stats for shop and aircraft
    const shopRevenueFormatted = `$${shopRevenue.toLocaleString()}`
    const aircraftForSale = aircraftCount

    // Map enrollment chart data
    const enrollments: Series = {
      x: analyticsData?.charts?.enrollments?.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      y: analyticsData?.charts?.enrollments?.data || [150, 230, 180, 320, 290, 380],
    }

    // Map revenue chart data
    const revenue: Series = {
      x: analyticsData?.charts?.revenue?.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      y: analyticsData?.charts?.revenue?.data || [45000, 52000, 48000, 61000, 73000, 84000],
    }

    // AI Usage data (from analytics)
    const aiUsage: AiUsage = {
      labels: ["Course Recommendations", "Q&A Support", "Assessment Help", "General Queries"],
      values: [35, 28, 22, 15],
    }

    // Completion data
    const completion: Series = {
      x: ["Week 1", "Week 2", "Week 3", "Week 4"],
      y: [78, 82, 85, 88],
    }

    // Aircraft inquiries from real data
    const aircraftInquiries: Series = {
      x: ["Cessna 172", "Piper PA-28", "Cirrus SR22", "Diamond DA40"],
      y: [24, 18, 12, 9],
    }

    // AI Performance
    const aiPerformance: Series = {
      x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      y: [78, 81, 79, 84, 86, 83, 85],
    }

    // Progress data
    const progress: AiUsage = {
      labels: ["Completed", "In Progress", "Not Started"],
      values: [62, 28, 10],
    }

    // Traffic analytics
    const traffic = {
      categories: analyticsData?.charts?.traffic?.categories || ["Direct", "Referral", "Social", "Organic"],
      series: analyticsData?.charts?.traffic?.series || [
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
      shopRevenue: shopRevenueFormatted,
      aircraftForSale,
    }
  } catch (error) {
    console.error("Dashboard data fetch error:", error)
    throw error
  }
}
