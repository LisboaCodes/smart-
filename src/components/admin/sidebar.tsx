'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Monitor,
  DollarSign,
  Receipt,
  Users,
  Megaphone,
  Store,
  Settings,
  UserCog,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Estoque',
    href: '/estoque',
    icon: Package,
  },
  {
    title: 'PDV',
    href: '/pdv',
    icon: Monitor,
  },
  {
    title: 'Vendas',
    href: '/vendas',
    icon: ShoppingCart,
  },
  {
    title: 'Financeiro',
    href: '/financeiro',
    icon: DollarSign,
  },
  {
    title: 'Contas Fixas',
    href: '/contas',
    icon: Receipt,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Marketing',
    href: '/marketing',
    icon: Megaphone,
  },
  {
    title: 'Atendimento',
    href: '/atendimento',
    icon: MessageCircle,
  },
  {
    title: 'Loja Virtual',
    href: '/loja-admin',
    icon: Store,
  },
  {
    title: 'Usuários',
    href: '/usuarios',
    icon: UserCog,
  },
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden hidden" id="sidebar-overlay" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-64 -translate-x-full border-r bg-card transition-transform lg:translate-x-0">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Smart+</span>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="space-y-1 p-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}
