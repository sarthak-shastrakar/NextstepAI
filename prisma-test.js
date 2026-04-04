const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$connect()
    console.log('Database connection successful')
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
  } catch (e) {
    console.error('Database connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
