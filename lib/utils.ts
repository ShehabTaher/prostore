import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert prisma object into regular JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [integerPart, decimalPart] = num.toString().split('.')
  return decimalPart
    ? `${integerPart}.${decimalPart.padEnd(2, '0')}`
    : `${integerPart}.00`
}

// Round number to 2 decimal places
export function roundTo2DecimalPlaces(value: number | string) {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100
  } else {
    throw new Error('Value is not a number or string')
  }
}
