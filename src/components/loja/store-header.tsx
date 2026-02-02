'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'
import { storeConfig } from '@/lib/store-config'
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Instagram,
  User,
} from 'lucide-react'

export function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { getItemCount } = useCart()
  const cartCount = getItemCount()
  const pathname = usePathname()
  const router = useRouter()

  // Fechar menu quando a rota mudar
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/loja?busca=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMenuOpen(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/loja?busca=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar with gradient */}
      <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link href="/loja" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden">
              <Image
                src={storeConfig.logo}
                alt={storeConfig.logoAlt}
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold hidden sm:inline bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 bg-clip-text text-transparent">
              {storeConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/loja"
              className="text-sm font-medium hover:text-gold-600 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/loja?categoria=bolsas"
              className="text-sm font-medium hover:text-gold-600 transition-colors"
            >
              Bolsas
            </Link>
            <Link
              href="/loja?categoria=joias"
              className="text-sm font-medium hover:text-gold-600 transition-colors"
            >
              Joias
            </Link>
            <Link
              href="/loja?categoria=semi-joias"
              className="text-sm font-medium hover:text-gold-600 transition-colors"
            >
              Semi-joias
            </Link>
            <Link
              href="/loja?categoria=bijuterias"
              className="text-sm font-medium hover:text-gold-600 transition-colors"
            >
              Bijuterias
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 border-gold-300 focus:border-gold-500 focus:ring-gold-500"
            />
          </form>

          {/* Instagram */}
          <Button variant="ghost" size="icon" className="hover:text-gold-600" asChild>
            <a
              href={storeConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </Button>

          {/* User Account */}
          <Button variant="ghost" size="icon" className="hover:text-gold-600" asChild>
            <Link href="/loja/conta">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          {/* Cart */}
          <Link href="/loja/carrinho">
            <Button
              variant="outline"
              size="icon"
              className="relative border-gold-400 hover:bg-gold-50 hover:border-gold-500"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gold-600 hover:bg-gold-700">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col gap-2">
            <form onSubmit={handleSearch} className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 border-gold-300 focus:border-gold-500"
              />
            </form>
            <Link
              href="/loja"
              className="p-2 hover:bg-gold-50 hover:text-gold-700 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/loja?categoria=bolsas"
              className="p-2 hover:bg-gold-50 hover:text-gold-700 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Bolsas
            </Link>
            <Link
              href="/loja?categoria=joias"
              className="p-2 hover:bg-gold-50 hover:text-gold-700 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Joias
            </Link>
            <Link
              href="/loja?categoria=semi-joias"
              className="p-2 hover:bg-gold-50 hover:text-gold-700 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Semi-joias
            </Link>
            <Link
              href="/loja?categoria=bijuterias"
              className="p-2 hover:bg-gold-50 hover:text-gold-700 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Bijuterias
            </Link>
            <Link
              href="/loja/conta"
              className="p-2 hover:bg-gold-50 hover:text-gold-700 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Minha Conta
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
