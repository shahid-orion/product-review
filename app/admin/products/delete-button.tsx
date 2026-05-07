"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?\n\nThis will permanently remove the product and its Cloudinary image.`
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${productId}/manage`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success(`"${productName}" deleted successfully`)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete product")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting}>
      <Trash className={`h-4 w-4 ${deleting ? 'text-muted-foreground animate-pulse' : 'text-destructive'}`} />
    </Button>
  )
}
