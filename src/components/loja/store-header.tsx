'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
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
  User,
} from 'lucide-react'

export function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { getItemCount } = useCart()
  const cartCount = getItemCount()
  const pathname = usePathname()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu e busca quando a rota mudar
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // Fechar menu ao clicar fora
  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Bloquear scroll quando menu mobile aberto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/loja?busca=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMenuOpen(false)
      setSearchOpen(false)
    }
  }

  return (
    <header ref={menuRef} className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar with gradient */}
      <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

      <div className="container flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link href="/loja" className="flex items-center">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden">
              <Image
                src={storeConfig.logo}
                alt={storeConfig.logoAlt}
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/loja" className="text-sm font-medium hover:text-gold-600 transition-colors">
              Inicio
            </Link>
            <Link href="/loja?categoria=bolsas" className="text-sm font-medium hover:text-gold-600 transition-colors">
              Bolsas
            </Link>
            <Link href="/loja?categoria=joias" className="text-sm font-medium hover:text-gold-600 transition-colors">
              Joias
            </Link>
            <Link href="/loja?categoria=semi-joias" className="text-sm font-medium hover:text-gold-600 transition-colors">
              Semi-joias
            </Link>
            <Link href="/loja?categoria=bijuterias" className="text-sm font-medium hover:text-gold-600 transition-colors">
              Bijuterias
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-gold-300 focus:border-gold-500 focus:ring-gold-500"
            />
          </form>

          {/* Search - Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 hover:text-gold-600"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* User Account */}
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-gold-600" asChild>
            <Link href="/loja/conta">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          {/* Cart */}
          <Link href="/loja/carrinho">
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 border-gold-400 hover:bg-gold-50 hover:border-gold-500"
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

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden border-t px-3 py-2 animate-fade-in">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-gold-300 focus:border-gold-500"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Navigation - fullscreen overlay */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 top-[57px] bg-black/40 z-40 md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed left-0 right-0 top-[57px] z-50 md:hidden bg-background border-t shadow-lg animate-fade-in max-h-[70vh] overflow-y-auto">
            <nav className="py-2 flex flex-col">
              <Link
                href="/loja"
                className="px-5 py-3.5 text-base font-medium hover:bg-gold-50 hover:text-gold-700 active:bg-gold-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/loja?categoria=bolsas"
                className="px-5 py-3.5 text-base font-medium hover:bg-gold-50 hover:text-gold-700 active:bg-gold-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Bolsas
              </Link>
              <Link
                href="/loja?categoria=joias"
                className="px-5 py-3.5 text-base font-medium hover:bg-gold-50 hover:text-gold-700 active:bg-gold-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Joias
              </Link>
              <Link
                href="/loja?categoria=semi-joias"
                className="px-5 py-3.5 text-base font-medium hover:bg-gold-50 hover:text-gold-700 active:bg-gold-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Semi-joias
              </Link>
              <Link
                href="/loja?categoria=bijuterias"
                className="px-5 py-3.5 text-base font-medium hover:bg-gold-50 hover:text-gold-700 active:bg-gold-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Bijuterias
              </Link>
              <div className="border-t my-1" />
              <Link
                href="/loja/conta"
                className="px-5 py-3.5 text-base font-medium hover:bg-gold-50 hover:text-gold-700 active:bg-gold-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Minha Conta
              </Link>
              <a
                href={storeConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 text-base font-medium hover:bg-gold-50 hover:text-gold-700 active:bg-gold-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Instagram
              </a>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
