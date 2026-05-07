import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // 1. Auth & RBAC Check (Must be an Admin to create products)
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, price, brandId, categoryId, imageUrl } = body;

    // 2. Basic Validation
    if (!name || !slug || !price || !brandId || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Check for slug uniqueness
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return NextResponse.json({ error: 'A product with this URL slug already exists.' }, { status: 409 });
    }

    // 4. Save to Database
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        imageUrl,
        brandId,
        categoryId,
      }
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
