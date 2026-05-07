import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteProductButton } from "./delete-button"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No products found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                    )}
                    {product.name}
                  </TableCell>
                  <TableCell>{product.brand.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>${product.price?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
