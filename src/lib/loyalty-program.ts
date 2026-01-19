// Loyalty Program / Fidelidade
// Points system for customer rewards

export interface LoyaltyConfig {
  pointsPerReal: number // Points earned per R$ 1 spent
  pointsToReal: number // Points needed to get R$ 1 discount
  minPointsToRedeem: number // Minimum points to start redeeming
  maxDiscountPercent: number // Maximum discount percentage using points
  welcomeBonus: number // Points given on first purchase
  birthdayBonus: number // Points given on birthday
  reviewBonus: number // Points given for product review
  referralBonus: number // Points for referring a friend
}

export const defaultLoyaltyConfig: LoyaltyConfig = {
  pointsPerReal: 1, // 1 point per R$ 1
  pointsToReal: 10, // 10 points = R$ 1
  minPointsToRedeem: 100, // Minimum 100 points (R$ 10)
  maxDiscountPercent: 30, // Max 30% discount with points
  welcomeBonus: 50, // 50 points on first purchase
  birthdayBonus: 100, // 100 points on birthday
  reviewBonus: 20, // 20 points for review
  referralBonus: 50, // 50 points for referral
}

// Calculate points earned from a purchase
export function calculatePointsEarned(
  purchaseAmount: number,
  config: LoyaltyConfig = defaultLoyaltyConfig,
  isFirstPurchase: boolean = false
): number {
  let points = Math.floor(purchaseAmount * config.pointsPerReal)

  if (isFirstPurchase) {
    points += config.welcomeBonus
  }

  return points
}

// Calculate discount from points
export function calculatePointsDiscount(
  points: number,
  subtotal: number,
  config: LoyaltyConfig = defaultLoyaltyConfig
): { discount: number; pointsUsed: number } {
  if (points < config.minPointsToRedeem) {
    return { discount: 0, pointsUsed: 0 }
  }

  const maxDiscount = subtotal * (config.maxDiscountPercent / 100)
  const pointsValue = points / config.pointsToReal
  const discount = Math.min(pointsValue, maxDiscount)
  const pointsUsed = Math.ceil(discount * config.pointsToReal)

  return {
    discount: Math.round(discount * 100) / 100,
    pointsUsed,
  }
}

// Get loyalty tier based on total points
export interface LoyaltyTier {
  name: string
  minPoints: number
  benefits: string[]
  color: string
  icon: string
}

export const loyaltyTiers: LoyaltyTier[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    benefits: ['1 ponto por R$ 1', 'Ofertas exclusivas por email'],
    color: '#CD7F32',
    icon: '🥉',
  },
  {
    name: 'Prata',
    minPoints: 500,
    benefits: ['1.5 pontos por R$ 1', 'Frete gratis acima de R$ 150', 'Acesso antecipado a promocoes'],
    color: '#C0C0C0',
    icon: '🥈',
  },
  {
    name: 'Ouro',
    minPoints: 2000,
    benefits: ['2 pontos por R$ 1', 'Frete gratis', '10% desconto no aniversario', 'Atendimento prioritario'],
    color: '#FFD700',
    icon: '🥇',
  },
  {
    name: 'Diamante',
    minPoints: 5000,
    benefits: ['3 pontos por R$ 1', 'Frete gratis expresso', '15% desconto no aniversario', 'Presentes exclusivos', 'Convites para eventos'],
    color: '#B9F2FF',
    icon: '💎',
  },
]

export function getLoyaltyTier(totalPoints: number): LoyaltyTier {
  for (let i = loyaltyTiers.length - 1; i >= 0; i--) {
    if (totalPoints >= loyaltyTiers[i].minPoints) {
      return loyaltyTiers[i]
    }
  }
  return loyaltyTiers[0]
}

export function getNextTier(totalPoints: number): LoyaltyTier | null {
  const currentTier = getLoyaltyTier(totalPoints)
  const currentIndex = loyaltyTiers.findIndex(t => t.name === currentTier.name)

  if (currentIndex < loyaltyTiers.length - 1) {
    return loyaltyTiers[currentIndex + 1]
  }

  return null
}

export function getPointsToNextTier(totalPoints: number): number {
  const nextTier = getNextTier(totalPoints)
  if (!nextTier) return 0
  return nextTier.minPoints - totalPoints
}

// Points multiplier based on tier
export function getTierMultiplier(tier: LoyaltyTier): number {
  switch (tier.name) {
    case 'Diamante':
      return 3
    case 'Ouro':
      return 2
    case 'Prata':
      return 1.5
    default:
      return 1
  }
}

// Transaction types for points history
export type PointsTransactionType =
  | 'purchase'
  | 'welcome'
  | 'birthday'
  | 'review'
  | 'referral'
  | 'redemption'
  | 'expired'
  | 'adjustment'

export interface PointsTransaction {
  id: string
  customerId: string
  type: PointsTransactionType
  points: number // Positive for earned, negative for used/expired
  description: string
  orderId?: string
  createdAt: Date
  expiresAt?: Date
}

export function getTransactionLabel(type: PointsTransactionType): string {
  const labels: Record<PointsTransactionType, string> = {
    purchase: 'Compra',
    welcome: 'Bonus de boas-vindas',
    birthday: 'Bonus de aniversario',
    review: 'Avaliacao de produto',
    referral: 'Indicacao de amigo',
    redemption: 'Resgate de pontos',
    expired: 'Pontos expirados',
    adjustment: 'Ajuste manual',
  }
  return labels[type] || type
}
