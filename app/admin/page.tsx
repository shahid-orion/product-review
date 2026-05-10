"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, Star, TrendingUp } from "lucide-react"

// A component that animates a number counting up
function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span>{display}</motion.span>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalReviews: 0,
    pendingReviews: 0,
  })

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data)
      })
      .catch((err) => console.error('Failed to load admin stats:', err))
  }, [])

  const statCards = [
    { title: "Total Products", value: stats.totalProducts, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-green-500", bg: "bg-green-50" },
    { title: "Total Reviews", value: stats.totalReviews, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
    { title: "Pending Reviews", value: stats.pendingReviews, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome to the ProductReview admin portal.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
          >
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedCounter value={stat.value} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="border-border/50 shadow-sm h-64 flex items-center justify-center bg-card">
            <p className="text-muted-foreground">Recent Activity Chart (Placeholder)</p>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card className="border-border/50 shadow-sm h-64 flex items-center justify-center bg-card">
            <p className="text-muted-foreground">Top Performing Products (Placeholder)</p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
