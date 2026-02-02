// Shipping calculation for store

const FREE_SHIPPING_ZIP = '49680-000'
const STANDARD_SHIPPING_COST = 19.90

export function calculateShipping(zipCode: string): number {
  // Remove formatting from zip code
  const cleanZip = zipCode.replace(/\D/g, '')
  const freeZip = FREE_SHIPPING_ZIP.replace(/\D/g, '')

  if (cleanZip === freeZip) {
    return 0
  }

  return STANDARD_SHIPPING_COST
}

export function formatZipCode(zipCode: string): string {
  const clean = zipCode.replace(/\D/g, '')
  if (clean.length === 8) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`
  }
  return clean
}

export function isValidZipCode(zipCode: string): boolean {
  const clean = zipCode.replace(/\D/g, '')
  return clean.length === 8
}
