"use client"

import { motion } from "motion/react"

interface CacheBannerProps {
  source: 'REDIS_CACHE' | 'DATABASE_AGGREGATION' | string
  responseTimeMs: number
}

export function CacheBanner({ source, responseTimeMs }: CacheBannerProps) {
  const isCache = source === 'REDIS_CACHE'

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl shadow-md border-l-8 flex items-center justify-between ${isCache ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
    >
      <div>
        <h2 className={`font-bold text-lg ${isCache ? 'text-green-800' : 'text-red-800'}`}>
          Data Source: {source}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isCache 
            ? '⚡ Lightning fast! Data served directly from memory.' 
            : '🐢 Slower. Data had to be aggregated from Postgres and MongoDB.'}
        </p>
      </div>
      <div className="text-right">
        <div className={`text-4xl font-black tracking-tighter ${isCache ? 'text-green-600' : 'text-red-600'}`}>
          {responseTimeMs}
          <span className="text-xl font-bold ml-1">ms</span>
        </div>
      </div>
    </motion.div>
  )
}
