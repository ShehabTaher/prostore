import 'dotenv/config'
import { prisma, prismaBase } from './prisma'
import sampleData from './sample-data'

type AuthTables = {
  account: { deleteMany: () => Promise<unknown> }
  session: { deleteMany: () => Promise<unknown> }
  verificationToken: { deleteMany: () => Promise<unknown> }
  user: {
    deleteMany: () => Promise<unknown>
    createMany: (args: { data: typeof sampleData.users }) => Promise<unknown>
  }
  $disconnect: () => Promise<void>
}

const db = prismaBase as unknown as AuthTables

async function main() {
  await prisma.product.deleteMany()
  await db.account.deleteMany()
  await db.session.deleteMany()
  await db.verificationToken.deleteMany()
  await db.user.deleteMany()

  await prisma.product.createMany({
    data: sampleData.products,
  })
  await db.user.createMany({
    data: sampleData.users,
  })
  console.log('Database seeded successfully')
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
