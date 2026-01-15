import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: (() => {
        const url = process.env.DATABASE_URL;
        if (!url) return undefined;
        if (url.includes('pgbouncer=true')) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}pgbouncer=true&connection_limit=1`;
      })()
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
