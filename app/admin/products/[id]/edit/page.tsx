import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EditProductForm } from "./edit-product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany(),
    prisma.brand.findMany()
  ])

  if (!product) return notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground mt-2">Update product details for "{product.name}".</p>
      </div>

      <EditProductForm product={product} categories={categories} brands={brands} />
    </div>
  )
}
