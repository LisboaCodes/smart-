import { StoreHeader } from '@/components/loja/store-header'
import { StoreFooter } from '@/components/loja/store-footer'

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  )
}
