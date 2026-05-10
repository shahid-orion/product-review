import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    if (key === '__all__') {
      await redis.del('all_products', 'all_products_full');
      return NextResponse.json({ success: true, cleared: ['all_products', 'all_products_full'] });
    }

    // Only allow clearing known safe keys (prevent arbitrary Redis key deletion)
    const ALLOWED_KEYS = new Set(['all_products', 'all_products_full']);
    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: 'Key not allowed' }, { status: 400 });
    }

    await redis.del(key);
    return NextResponse.json({ success: true, cleared: key });
  } catch (error) {
    console.error('Error in DELETE /api/admin/cache:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
