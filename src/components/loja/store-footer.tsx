import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Phone, MapPin, Mail, MessageCircle } from 'lucide-react'
import { storeConfig, getWhatsAppLink } from '@/lib/store-config'

export function StoreFooter() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-gold-50/50">
      {/* Gold gradient top border */}
      <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descricao */}
          <div className="space-y-4">
            <Link href="/loja" className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden">
                <Image
                  src={storeConfig.logo}
                  alt={storeConfig.logoAlt}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 bg-clip-text text-transparent">
                {storeConfig.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {storeConfig.slogan}. Bolsas, joias, semi-joias
              e bijuterias com qualidade e preco justo.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gold-700">Categorias</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
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

          {/* Atendimento */}
          <div>
            <h3 className="font-semibold mb-4 text-gold-700">Atendimento</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-500" />
                {storeConfig.phone}
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gold-500" />
                <a
                  href={getWhatsAppLink('Ola! Gostaria de mais informacoes.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-600 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-500" />
                {storeConfig.email}
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-gold-500" />
                <a
                  href={storeConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-600 transition-colors"
                >
                  {storeConfig.instagram}
                </a>
              </li>
            </ul>
          </div>

          {/* Endereco */}
          <div>
            <h3 className="font-semibold mb-4 text-gold-700">Nossa Loja</h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
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

        <div className="mt-8 pt-8 border-t border-gold-200 text-center text-sm text-muted-foreground">
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
