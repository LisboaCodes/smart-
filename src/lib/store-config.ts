// Store configuration - can be managed via admin settings in the future
// For now, these values can be changed here or loaded from database/API

export interface StoreConfig {
  // Branding
  name: string
  slogan: string
  logo: string
  logoAlt: string
  favicon: string

  // Contact
  phone: string
  whatsapp: string
  email: string
  instagram: string
  instagramUrl: string

  // Address
  address: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }

  // Business
  cnpj: string

  // Theme colors (hex)
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    accent: string
    gold: {
      light: string
      medium: string
      dark: string
      darker: string
    }
  }
}

// Default store configuration
export const storeConfig: StoreConfig = {
  // Branding
  name: 'Smart+ Acessorios',
  slogan: 'Os melhores acessorios para voce brilhar',
  logo: '/logo.png',
  logoAlt: 'Smart+ Acessorios Logo',
  favicon: '/favicon.ico',

  // Contact
  phone: '(79) 99972-5821',
  whatsapp: '5579999725821',
  email: 'contato@smartacessorios.com.br',
  instagram: '@smartmaisacessorios',
  instagramUrl: 'https://www.instagram.com/smartmaisacessorios_/',

  // Address
  address: {
    street: 'Galeria Porto Plaza',
    number: 'sala 05',
    complement: '',
    neighborhood: 'Centro',
    city: 'Nossa Senhora da Gloria',
    state: 'SE',
    zipCode: '49680-000',
  },

  // Business
  cnpj: '52.875.660/0001-10',

  // Theme colors
  colors: {
    primary: '#c99c38',
    primaryLight: '#deb65c',
    primaryDark: '#a67c2a',
    accent: '#f9dc9c',
    gold: {
      light: '#f9dc9c',
      medium: '#fee09f',
      dark: '#deb65c',
      darker: '#c99c38',
    },
  },
}

// Helper function to get store config (can be extended to fetch from DB/API)
export function getStoreConfig(): StoreConfig {
  return storeConfig
}

// Helper to format full address
export function getFullAddress(): string {
  const { address } = storeConfig
  return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}. ${address.neighborhood}, ${address.city} - ${address.state}. CEP: ${address.zipCode}`
}

// Helper to get WhatsApp link
export function getWhatsAppLink(message?: string): string {
  const baseUrl = `https://wa.me/${storeConfig.whatsapp}`
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`
  }
  return baseUrl
}
