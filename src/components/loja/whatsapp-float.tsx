'use client'

import { MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/store-config'

export function WhatsAppFloat() {
  return (
    <a
      href={getWhatsAppLink('Ola! Gostaria de mais informacoes.')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 active:bg-green-700 hover:scale-110 transition-all duration-300"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  )
}
