import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { getStoreProductById, getRelatedStoreProducts } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { ProductActions } from './product-actions'
import { ProductCard } from '@/components/loja/product-card'
import {
  ChevronLeft,
  Package,
  Truck,
  Shield,
} from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const product = await getStoreProductById(params.id)

  if (!product) {
    return {
      title: 'Produto não encontrado',
    }
  }

  const hasPromo =
    product.promoPrice &&
    product.promoEndDate &&
    new Date() <= new Date(product.promoEndDate)
  const price = hasPromo ? Number(product.promoPrice) : Number(product.salePrice)
  const mainImage = product.images?.[0]?.url || '/placeholder.svg'
  const imageUrl = mainImage.startsWith('http') ? mainImage : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}${mainImage}`

  return {
    title: `${product.name} - Smart+ Acessórios`,
    description: product.description || `Compre ${product.name} na Smart+ Acessórios. ${formatCurrency(price)}`,
    openGraph: {
      title: product.name,
      description: product.description || `Compre ${product.name} na Smart+ Acessórios`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
      siteName: 'Smart+ Acessórios',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Compre ${product.name} na Smart+ Acessórios`,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getStoreProductById(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedStoreProducts(product.categoryId, product.id)

  const hasPromo =
    product.promoPrice &&
    product.promoEndDate &&
    new Date() <= new Date(product.promoEndDate)
  const price = hasPromo ? Number(product.promoPrice) : Number(product.salePrice)
  const originalPrice = hasPromo ? Number(product.salePrice) : undefined
  const discount = hasPromo
    ? Math.round(
        ((Number(product.salePrice) - Number(product.promoPrice)) /
          Number(product.salePrice)) *
          100
      )
    : 0

  const mainImage = product.images?.[0]?.url || '/placeholder.svg'

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/loja" className="hover:text-gold-600">
          <ChevronLeft className="h-4 w-4 inline" />
          Voltar
        </Link>
        <span className="text-gold-400">/</span>
        <Link
          href={`/loja?categoria=${product.categoryName?.toLowerCase()}`}
          className="hover:text-gold-600"
        >
          {product.categoryName}
        </Link>
        <span className="text-gold-400">/</span>
        <span className="text-gold-700">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagens */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gold-50 to-gold-100 border border-gold-200">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
              unoptimized={mainImage === '/placeholder.svg'}
            />
            {hasPromo && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-3 py-1">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image: any, idx: number) => (
                <div
                  key={image.id}
                  className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 border-gold-200 hover:border-gold-500 cursor-pointer transition-colors"
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} - Imagem ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gold-600 dark:text-gold-400 mb-1">
              {product.categoryName} | SKU: {product.sku}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
          </div>

          {/* Preco */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-gold-700">
                {formatCurrency(price)}
              </span>
              {hasPromo && originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              ou 12x de {formatCurrency(price / 12)} sem juros
            </p>
          </div>

          {/* Estoque */}
          <div>
            {product.stock > 0 ? (
              <Badge variant="secondary" className="text-sm bg-green-100 text-green-800">
                Em estoque ({product.stock} disponiveis)
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-sm">
                Produto esgotado
              </Badge>
            )}
          </div>

          {/* Acoes - Client Component */}
          <ProductActions
            product={{
              id: product.id,
              name: product.name,
              price,
              originalPrice,
              image: product.images?.[0]?.url || null,
              sku: product.sku,
              stock: product.stock,
            }}
          />

          <Separator />

          {/* Beneficios */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-gold-50 to-gold-100/50 rounded-lg border border-gold-200">
            <div className="text-center">
              <Truck className="h-8 w-8 mx-auto text-gold-600 mb-2" />
              <p className="text-xs text-muted-foreground">
                Entrega para todo Brasil
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto text-gold-600 mb-2" />
              <p className="text-xs text-muted-foreground">Compra segura</p>
            </div>
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto text-gold-600 mb-2" />
              <p className="text-xs text-muted-foreground">
                Embalagem especial
              </p>
            </div>
          </div>

          <Separator className="bg-gold-200" />

          {/* Descricao */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2 text-gold-800">Descricao</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Produtos relacionados */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-gold-800">Voce tambem pode gostar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct: any) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
