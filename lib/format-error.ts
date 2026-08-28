import { ZodError } from 'zod'
import { Prisma } from '@/lib/generated/prisma/client'

function getDuplicateField(error: Prisma.PrismaClientKnownRequestError) {
  const meta = error.meta as {
    target?: string[]
    driverAdapterError?: {
      cause?: {
        constraint?: {
          fields?: string[]
        }
      }
    }
  }

  const adapterField = meta.driverAdapterError?.cause?.constraint?.fields?.[0]
  if (adapterField) return adapterField

  const legacyField = meta.target?.[0]
  if (legacyField) return legacyField

  const match = error.message.match(/fields: \(`([^`]+)`\)/)
  return match?.[1]
}

export function formatError(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(', ')
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const field = getDuplicateField(error) ?? 'field'
    return `${field.charAt(0).toUpperCase()}${field.slice(1)} already exists`
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong'
}
