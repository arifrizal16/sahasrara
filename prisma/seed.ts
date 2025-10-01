import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default users
  const defaultUsers = [
    {
      name: 'Admin User',
      email: 'admin@sahasrara.com',
      pin: '1234',
      role: 'ADMIN' as const,
    },
    {
      name: 'Staff User',
      email: 'staff@sahasrara.com',
      pin: '5678',
      role: 'STAFF' as const,
    },
    {
      name: 'Owner User',
      email: 'owner@sahasrara.com',
      pin: '9999',
      role: 'OWNER' as const,
    },
  ]

  for (const user of defaultUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: user
      })
      console.log(`✅ Created user: ${user.name} (${user.email}) with PIN: ${user.pin}`)
    } else {
      console.log(`ℹ️  User already exists: ${user.name} (${user.email})`)
    }
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })