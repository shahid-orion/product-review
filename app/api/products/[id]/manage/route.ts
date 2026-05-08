import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db-mongo';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: extract Cloudinary public_id from a URL
function extractPublicId(url: string): string | null {
  try {
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function deleteCloudinaryImage(imageUrl: string) {
  const publicId = extractPublicId(imageUrl);
  if (publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      // console.log(`Cloudinary image deleted: ${publicId}`, result);
    } catch (e) {
      console.error('Cloudinary delete failed for publicId:', publicId, e);
    }
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, price, brandId, categoryId, imageUrl } = body;

    if (!name || !slug || !price || !brandId || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check slug uniqueness (excluding self)
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 409 });
    }

    // If image changed, delete the OLD one from Cloudinary
    const currentProduct = await prisma.product.findUnique({ where: { id }, select: { imageUrl: true } });
    const oldImageUrl = currentProduct?.imageUrl || '';
    const newImageUrl = imageUrl || '';

    if (oldImageUrl && newImageUrl && oldImageUrl !== newImageUrl) {
      // console.log('Image changed! Deleting old Cloudinary image...');
      // console.log('  Old:', oldImageUrl);
      // console.log('  New:', newImageUrl);
      await deleteCloudinaryImage(oldImageUrl);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { name, slug, description, price, imageUrl: newImageUrl, brandId, categoryId },
    });

    // Invalidate Redis cache
    await redis.del(`product_profile:${id}`);
    await redis.del('all_products');

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error in PUT /api/products/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    // 1. Get the product to find its Cloudinary image URL
    const product = await prisma.product.findUnique({ where: { id }, select: { imageUrl: true } });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 2. Delete image from Cloudinary
    if (product.imageUrl) {
      await deleteCloudinaryImage(product.imageUrl);
    }

    // 3. Delete ALL reviews for this product from MongoDB
    const mongoDb = await getMongoDb();
    const deleteResult = await mongoDb.collection('reviews').deleteMany({ productId: id });
    // console.log(`Deleted ${deleteResult.deletedCount} reviews from MongoDB for product: ${id}`);

    // 4. Delete the product from Postgres
    await prisma.product.delete({ where: { id } });

    // 5. Clean up ALL Redis keys related to this product
    await redis.del(`product_profile:${id}`);
    await redis.del(`product:stats:${id}`);
    await redis.del('all_products');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
