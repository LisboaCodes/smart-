import Link from 'next/link'
import Image from 'next/image'
import { Instagram, MapPin, Mail, MessageCircle } from 'lucide-react'
import { storeConfig, getWhatsAppLink } from '@/lib/store-config'

export function StoreFooter() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-gold-50/50">
      {/* Gold gradient top border */}
      <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo e descricao */}
          <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <Link href="/loja" className="flex items-center gap-2 sm:gap-3">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden">
                <Image
                  src={storeConfig.logo}
                  alt={storeConfig.logoAlt}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 bg-clip-text text-transparent">
                {storeConfig.name}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {storeConfig.slogan}. Bolsas, joias, semi-joias
              e bijuterias com qualidade e preco justo.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-gold-700">Categorias</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/loja?categoria=bolsas" className="hover:text-gold-600 transition-colors">
                  Bolsas
                </Link>
              </li>
              <li>
                <Link href="/loja?categoria=joias" className="hover:text-gold-600 transition-colors">
                  Joias
                </Link>
              </li>
              <li>
                <Link href="/loja?categoria=semi-joias" className="hover:text-gold-600 transition-colors">
                  Semi-joias
                </Link>
              </li>
              <li>
                <Link href="/loja?categoria=bijuterias" className="hover:text-gold-600 transition-colors">
                  Bijuterias
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-gold-700">Contato</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a
                  href={getWhatsAppLink('Ola! Gostaria de mais informacoes.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-gold-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-gold-500 flex-shrink-0" />
                  (79) 99972-5821
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-500 flex-shrink-0" />
                <span className="truncate">{storeConfig.email}</span>
              </li>
              <li>
                <a
                  href={storeConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-gold-600 transition-colors"
                >
                  <Instagram className="h-4 w-4 text-gold-500 flex-shrink-0" />
                  {storeConfig.instagram}
                </a>
              </li>
            </ul>
          </div>

          {/* Endereco */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-gold-700">Nossa Loja</h3>
            <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gold-500" />
              <p>
                {storeConfig.address.street}, {storeConfig.address.number}
                {storeConfig.address.complement && <><br />{storeConfig.address.complement}</>}
                <br />
                {storeConfig.address.city}, {storeConfig.address.state}
                <br />
                CEP: {storeConfig.address.zipCode}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gold-200 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {storeConfig.name}. Todos os direitos
            reservados.
          </p>
          <p className="mt-1">CNPJ: {storeConfig.cnpj}</p>
        </div>
      </div>
    </footer>
  )
}
