import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Sadif Pro...')

  const passwordHash = await bcrypt.hash('demo1234', 12)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@sadif.pro' },
    update: {},
    create: {
      email: 'alice@sadif.pro',
      name: 'Alice Chen',
      username: 'alice',
      passwordHash,
      avatar: null,
      profile: { create: {} }
    }
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@sadif.pro' },
    update: {},
    create: {
      email: 'bob@sadif.pro',
      name: 'Bob Kumar',
      username: 'bob',
      passwordHash,
      profile: { create: {} }
    }
  })

  const demoChat = await prisma.chat.create({
    data: {
      type: 'GROUP',
      name: 'Demo Group',
      participants: {
        create: [
          { userId: alice.id, role: 'OWNER' },
          { userId: bob.id, role: 'MEMBER' }
        ]
      },
      messages: {
        create: [
          { senderId: alice.id, content: 'Welcome to Sadif Pro! 🎉' },
          { senderId: bob.id, content: 'This is real-time with Socket.IO' },
          { senderId: alice.id, content: 'Try voice notes and calls - they work!' },
        ]
      }
    }
  })

  console.log('✓ Seeded:', { alice: alice.email, bob: bob.email, chat: demoChat.id })
}

main().catch(console.error).finally(() => prisma.$disconnect())
