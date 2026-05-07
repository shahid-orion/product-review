"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users, 
  Settings, 
  ChevronLeft, 
  Menu,
  MessageSquare,
  Flag
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Flagged", href: "/admin/reviews/flagged", icon: Flag },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-muted/20">
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 256,
          transition: { duration: 0.3, ease: "easeInOut" }
        }}
        className="flex flex-col bg-card border-r shadow-sm z-10 relative"
      >
        <div className="p-4 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex hover:bg-muted"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 p-4 pt-0">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </motion.aside>

      <main className="flex-1 overflow-y-auto p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
