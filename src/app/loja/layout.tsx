import { StoreHeader } from '@/components/loja/store-header'
import { StoreFooter } from '@/components/loja/store-footer'
import { WhatsAppFloat } from '@/components/loja/whatsapp-float'
import { CartProvider } from '@/contexts/cart-context'

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <StoreFooter />
        <WhatsAppFloat />
      </div>
    </CartProvider>
  )
}
