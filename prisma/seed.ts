import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL!
console.log('Connecting to:', connectionString.replace(/:[^@]+@/, ':***@'))

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean up existing data to avoid unique constraint errors during re-seeding
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@productreview.com',
      passwordHash: '$2a$10$xyz...', // In a real app, hash this properly
      role: 'ADMIN',
    },
  })

  const regularUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '$2a$10$xyz...',
      role: 'USER',
    },
  })

  // 2. Create Brands
  const apple = await prisma.brand.create({
    data: {
      name: 'Apple',
      slug: 'apple',
      description: 'Think Different.',
    },
  })

  const sony = await prisma.brand.create({
    data: {
      name: 'Sony',
      slug: 'sony',
      description: 'Make. Believe.',
    },
  })

  // 3. Create Categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
    },
  })

  const audio = await prisma.category.create({
    data: {
      name: 'Audio',
      slug: 'audio',
      parentId: electronics.id,
    },
  })

  const headphones = await prisma.category.create({
    data: {
      name: 'Headphones',
      slug: 'headphones',
      parentId: audio.id,
    },
  })

  // 4. Create Products
  await prisma.product.create({
    data: {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Industry leading noise canceling headphones.',
      price: 398.0,
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80',
      brandId: sony.id,
      categoryId: headphones.id,
    },
  })

  await prisma.product.create({
    data: {
      name: 'AirPods Pro 2',
      slug: 'apple-airpods-pro-2',
      description: 'Magic like you’ve never heard.',
      price: 249.0,
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80',
      brandId: apple.id,
      categoryId: headphones.id,
    },
  })

  console.log('Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
