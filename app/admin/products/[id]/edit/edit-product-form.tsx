"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Brand, Category, Product } from "@prisma/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { cloudinaryProjectFolder } from "@/lib/cloudinary-config"

async function uploadToCloudinary(file: File): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000)
  const folder = cloudinaryProjectFolder

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign: { folder, timestamp } }),
  })
  if (!signRes.ok) throw new Error("Failed to get upload signature")
  const { apiKey, cloudName, signature } = await signRes.json()

  const body = new FormData()
  body.append("file", file)
  body.append("folder", folder)
  body.append("timestamp", String(timestamp))
  body.append("api_key", apiKey)
  body.append("signature", signature)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body }
  )
  if (!uploadRes.ok) throw new Error("Failed to upload image to Cloudinary")
  const uploadData = await uploadRes.json()
  return uploadData.secure_url as string
}

interface EditProductFormProps {
  product: Product
  categories: Category[]
  brands: Brand[]
}

export function EditProductForm({ product, categories, brands }: EditProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState(product.imageUrl || "")
  const [name, setName] = useState(product.name)
  const [slug, setSlug] = useState(product.slug)
  const [description, setDescription] = useState(product.description || "")
  const [price, setPrice] = useState(product.price?.toString() || "")
  const [brandId, setBrandId] = useState(product.brandId)
  const [categoryId, setCategoryId] = useState(product.categoryId)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = currentImageUrl
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile)
      }

      const data = {
        name,
        slug,
        description,
        price: parseFloat(price),
        brandId,
        categoryId,
        imageUrl,
      }

      const res = await fetch(`/api/products/${product.id}/manage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update product")
      }

      toast.success("Product updated successfully")
      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Product Image</Label>
            {/* Show current image if it exists and no new file selected */}
            {currentImageUrl && !imageFile && (
              <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border shadow-sm mb-2">
                <img src={currentImageUrl} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  Current image
                </div>
              </div>
            )}
            <ImageUpload
              onChange={setImageFile}
              disabled={loading}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" required disabled={loading} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" required disabled={loading} value={slug} onChange={e => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" required disabled={loading} className="h-32" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step="0.01" required disabled={loading} value={price} onChange={e => setPrice(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandId">Brand</Label>
              <select
                id="brandId"
                required
                disabled={loading}
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a brand...</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                required
                disabled={loading}
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
