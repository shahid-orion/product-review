"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2, Zap, Database } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface SearchResult {
  id: string
  name: string
  price: number | null
  imageUrl: string | null
  brand: { name: string }
}

interface SearchResponse {
  results: SearchResult[]
  metadata: {
    source: string
    responseTimeMs: number
  }
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [metadata, setMetadata] = useState<SearchResponse['metadata'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        setMetadata(null)
        setIsOpen(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data: SearchResponse = await res.json()
        setResults(data.results || [])
        setMetadata(data.metadata || null)
        setIsOpen(true)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className="relative w-full max-w-md hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder="Search for premium products..."
          className="w-full pl-10 pr-10 bg-muted/50 border-border/50 focus-visible:ring-primary/20 rounded-full h-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 w-full bg-background border border-border shadow-xl rounded-xl overflow-hidden z-50"
          >
            {results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No products found for "{query}"
              </div>
            ) : (
              <div className="flex flex-col">
                {results.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.id}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-4 p-3 hover:bg-muted transition-colors border-b last:border-0">
                      <div className="h-10 w-10 bg-muted rounded-md overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.brand.name}</div>
                      </div>
                      <div className="font-bold text-sm text-primary whitespace-nowrap">
                        ${product.price?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                  </Link>
                ))}
                
                {metadata && (
                  <div className="p-2 bg-muted/50 border-t flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    <div className="flex items-center gap-1">
                      {metadata.source === 'REDIS_CACHE' ? (
                        <><Zap className="w-3 h-3 text-green-500 fill-green-500" /> Redis Cached</>
                      ) : (
                        <><Database className="w-3 h-3 text-blue-500" /> Database Search</>
                      )}
                    </div>
                    <div>{metadata.responseTimeMs}ms</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
