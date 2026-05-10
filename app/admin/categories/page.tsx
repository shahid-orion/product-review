import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tags, Layers } from 'lucide-react';
import type { Category } from '@prisma/client';

type CategoryWithChildren = Category & {
  children: Category[];
  _count: { products: number };
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null }, // top-level only
    include: {
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  const total = await prisma.category.count();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-2">
            {total} categor{total !== 1 ? 'ies' : 'y'} in the catalog.
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center p-16 bg-card rounded-xl border border-dashed">
          <Tags className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No categories yet. Add them via the Prisma seed or database tools.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(categories as CategoryWithChildren[]).map((cat) => (
            <Card key={cat.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Tags className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {cat._count.products} product{cat._count.products !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {cat.children.length > 0 && (
                  <div className="pt-2 border-t space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Subcategories
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cat.children.map((child) => (
                        <Badge key={child.id} variant="outline" className="text-xs">
                          {child.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
