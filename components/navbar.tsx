"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { LogOut, User, ShieldCheck } from "lucide-react"
import { SearchBar } from "@/components/search-bar"

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
    >
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 180 }} 
            transition={{ duration: 0.3 }}
            className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold"
          >
            PR
          </motion.div>
          <span className="font-bold text-xl tracking-tight">ProductReview</span>
        </Link>

        <div className="flex-1 max-w-lg mx-8 flex justify-center">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Explore
          </Link>
          
          {status === "loading" ? (
            <div className="w-20 h-8 bg-muted animate-pulse rounded-md" />
          ) : session?.user ? (
            <div className="flex items-center gap-4">
              {session.user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-3 pl-4 border-l">
                <span className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {session.user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
