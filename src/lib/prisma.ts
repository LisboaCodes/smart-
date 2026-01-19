import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient() {
  // Parse DATABASE_URL or use explicit config
  const pool = new Pool({
    host: process.env.DB_HOST || '201.23.70.201',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'filehub',
    user: process.env.DB_USER || 'filehub',
    password: process.env.DB_PASSWORD || 'FileHub2024@Secure!Pass',
  })

  const adapter = new PrismaPg(pool, {
    schema: 'smartloja',
  })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
