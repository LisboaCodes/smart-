// Phone number formatting and validation

const BRAZIL_CODE = '55'

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const clean = phone.replace(/\D/g, '')

  // If doesn't start with country code, add Brazil code
  let formatted = clean.startsWith(BRAZIL_CODE) ? clean : `${BRAZIL_CODE}${clean}`

  // Expected format: 5579999062129 (13 digits)
  return formatted
}

export function formatPhoneDisplay(phone: string): string {
  const clean = phone.replace(/\D/g, '')

  if (clean.length === 13 && clean.startsWith(BRAZIL_CODE)) {
    // Format: +55 (79) 99906-2129
    const ddd = clean.slice(2, 4)
    const firstPart = clean.slice(4, 9)
    const secondPart = clean.slice(9)
    return `+${BRAZIL_CODE} (${ddd}) ${firstPart}-${secondPart}`
  } else if (clean.length === 11) {
    // Format without country code: (79) 99906-2129
    const ddd = clean.slice(0, 2)
    const firstPart = clean.slice(2, 7)
    const secondPart = clean.slice(7)
    return `(${ddd}) ${firstPart}-${secondPart}`
  }

  return phone
}

export function isValidPhoneNumber(phone: string): boolean {
  const clean = phone.replace(/\D/g, '')

  // Accept with or without country code
  if (clean.length === 13 && clean.startsWith(BRAZIL_CODE)) {
    return true
  }
  if (clean.length === 11) {
    return true
  }

  return false
}

export function maskPhoneInput(value: string): string {
  const clean = value.replace(/\D/g, '')

  if (clean.length === 0) return ''

  // Format as user types: +55 (79) 99906-2129
  let masked = '+55 '

  if (clean.length > 2) {
    masked += `(${clean.slice(2, 4)}`
  }
  if (clean.length >= 4) {
    masked += `) ${clean.slice(4, 9)}`
  }
  if (clean.length >= 9) {
    masked += `-${clean.slice(9, 13)}`
  }

  return masked
}
