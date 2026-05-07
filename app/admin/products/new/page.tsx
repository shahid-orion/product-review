import { prisma } from "@/lib/prisma"
import { ProductForm } from "./product-form"

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany(),
    prisma.brand.findMany()
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
        <p className="text-muted-foreground mt-2">Add a new product to your catalog.</p>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  )
}
