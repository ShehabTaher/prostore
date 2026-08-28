import { prismaBase } from '@/db/prisma'
import type { UserModel } from '../lib/generated/prisma/models/User'

type UserClient = {
  findFirst(args: {
    where: { email: string }
  }): Promise<UserModel | null>
  create(args: {
    data: {
      name: string
      email: string
      password: string
    }
  }): Promise<UserModel>
  update(args: {
    where: { id: string }
    data: { name: string }
  }): Promise<UserModel>
}

function getUserClient() {
  return (prismaBase as unknown as { user: UserClient }).user
}

export async function getUserByEmail(email: string) {
  return getUserClient().findFirst({ where: { email } })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  return getUserClient().create({ data })
}

export async function updateUserName(id: string, name: string) {
  return getUserClient().update({ where: { id }, data: { name } })
}
