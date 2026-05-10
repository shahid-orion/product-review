"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ComparisonTable } from "@/components/comparison-table";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ChevronDown } from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
}

interface ComparedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  averageRating: string;
  reviewCount: number;
  specsJSON?: string | null;
}

function ProductSelector({
  label,
  value,
  onChange,
  options,
  exclude,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: ProductOption[];
  exclude: string;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
      <div className="relative">
        <select
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-8 text-sm font-medium shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Select a product —</option>
          {options
            .filter((p) => p.id !== exclude)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.price ? `· $${p.price.toFixed(2)}` : ""}
              </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

function ComparePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selA, setSelA] = useState(searchParams.get("a") ?? "");
  const [selB, setSelB] = useState(searchParams.get("b") ?? "");
  const [result, setResult] = useState<{ a: ComparedProduct; b: ComparedProduct } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load product list for the selectors
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (Array.isArray(data.products)) setProducts(data.products);
      });
  }, []);

  // Auto-compare if both IDs come from URL params
  useEffect(() => {
    if (selA && selB && selA !== selB) handleCompare(selA, selB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompare = async (a: string, b: string) => {
    if (!a || !b || a === b) return;
    setLoading(true);
    setError(null);
    setResult(null);
    router.replace(`/products/compare?a=${a}&b=${b}`, { scroll: false });
    try {
      const res = await fetch(`/api/products/compare?a=${a}&b=${b}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <ArrowLeftRight className="w-8 h-8 text-blue-500" />
            Product Comparison
          </h1>
          <p className="text-gray-500">Select two products to compare side-by-side.</p>
        </div>

        {/* Selector card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <ProductSelector
              label="Product A"
              value={selA}
              onChange={setSelA}
              options={products}
              exclude={selB}
            />
            <span className="text-gray-400 font-bold pb-2 hidden sm:block">VS</span>
            <ProductSelector
              label="Product B"
              value={selB}
              onChange={setSelB}
              options={products}
              exclude={selA}
            />
            <Button
              className="shrink-0 sm:mb-0"
              disabled={!selA || !selB || selA === selB || loading}
              onClick={() => handleCompare(selA, selB)}
            >
              {loading ? "Loading…" : "Compare"}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg w-full" />
            ))}
          </div>
        )}

        {/* Comparison result */}
        {result && !loading && <ComparisonTable a={result.a} b={result.b} />}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ComparePageInner />
    </Suspense>
  );
}
