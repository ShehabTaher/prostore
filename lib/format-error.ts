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
    return formatPayPalError(error.message) ?? error.message
  }

  return 'Something went wrong'
}

function formatPayPalError(message: string) {
  try {
    const parsed = JSON.parse(message) as {
      name?: string
      message?: string
      details?: { issue?: string; description?: string }[]
    }
    const detail = parsed.details?.[0]
    if (detail?.issue === 'COMPLIANCE_VIOLATION') {
      return 'PayPal sandbox blocked this payment (COMPLIANCE_VIOLATION). Use a US sandbox business account for the seller REST app, and a separate personal sandbox buyer to pay.'
    }
    if (detail?.description) return detail.description
    if (parsed.message) return parsed.message
  } catch {
    return null
  }
  return null
}
