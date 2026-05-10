"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Database, Trash2, RefreshCw, ShieldCheck, Info } from "lucide-react";

interface CacheAction {
  label: string;
  key: string;
  description: string;
  color: string;
}

const CACHE_ACTIONS: CacheAction[] = [
  {
    label: "Home page products",
    key: "all_products",
    description: "Cached product list shown on the landing page.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    label: "Explore page products",
    key: "all_products_full",
    description: "Full product list with brand & category relations.",
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
];

export default function AdminSettingsPage() {
  const [flushing, setFlushing] = useState<string | null>(null);

  const handleFlush = async (key: string, label: string) => {
    setFlushing(key);
    try {
      const res = await fetch(`/api/admin/cache?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Cache cleared: "${label}"`);
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Failed to clear cache");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setFlushing(null);
    }
  };

  const handleFlushAll = async () => {
    setFlushing("__all__");
    try {
      const res = await fetch("/api/admin/cache?key=__all__", { method: "DELETE" });
      if (res.ok) {
        toast.success("All product caches cleared");
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Failed to flush");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setFlushing(null);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Platform configuration and cache management.</p>
      </div>

      {/* Cache Management */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Database className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Redis Cache Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manually invalidate cached data. The next request will rebuild the cache from the database.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {CACHE_ACTIONS.map((action) => (
            <div
              key={action.key}
              className="flex items-center justify-between p-4 rounded-lg border bg-card gap-4"
            >
              <div className="space-y-0.5 min-w-0">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
                <Badge variant="outline" className={`text-xs font-mono mt-1 ${action.color}`}>
                  {action.key}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                disabled={flushing !== null}
                onClick={() => handleFlush(action.key, action.label)}
              >
                {flushing === action.key ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Clear
              </Button>
            </div>
          ))}

          <div className="pt-2 border-t">
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={flushing !== null}
              onClick={handleFlushAll}
            >
              {flushing === "__all__" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Clear All Product Caches
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <CardTitle className="text-lg">Platform Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { label: "Framework", value: "Next.js 16" },
              { label: "Database (Primary)", value: "Neon Postgres (via Prisma)" },
              { label: "Database (Reviews)", value: "MongoDB Atlas" },
              { label: "Cache", value: "Redis (ioredis)" },
              { label: "Image Storage", value: "Cloudinary" },
              { label: "Auth", value: "NextAuth v5 (Credentials)" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Product-profile caches (<code className="font-mono text-xs bg-blue-100 px-1 rounded">product_profile:*</code>) are
          auto-invalidated when a review is submitted or approved. You only need manual clearing for the product list caches above.
        </p>
      </div>
    </div>
  );
}
