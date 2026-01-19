import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getStoreProductById, getRelatedStoreProducts } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  Package,
  Truck,
  Shield,
  MessageCircle,
} from 'lucide-react'

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
  const price = hasPromo ? product.promoPrice : product.salePrice
  const discount = hasPromo
    ? Math.round(
        ((Number(product.salePrice) - Number(product.promoPrice)) /
          Number(product.salePrice)) *
          100
      )
    : 0

  const mainImage = product.images?.[0]?.url || '/placeholder.jpg'

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          <ChevronLeft className="h-4 w-4 inline" />
          Voltar
        </Link>
        <span>/</span>
        <Link
          href={`/?categoria=${product.categoryName?.toLowerCase()}`}
          className="hover:text-primary"
        >
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagens */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.images?.[0] ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
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
                  className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer"
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
            <p className="text-sm text-muted-foreground mb-1">
              {product.categoryName} | SKU: {product.sku}
            </p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">
                {formatCurrency(Number(price))}
              </span>
              {hasPromo && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(Number(product.salePrice))}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              ou 12x de {formatCurrency(Number(price) / 12)} sem juros
            </p>
          </div>

          {/* Estoque */}
          <div>
            {product.stock > 0 ? (
              <Badge variant="secondary" className="text-sm bg-green-100 text-green-800">
                Em estoque ({product.stock} disponíveis)
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-sm">
                Produto esgotado
              </Badge>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* WhatsApp */}
          <Button
            size="lg"
            variant="outline"
            className="w-full border-green-500 text-green-600 hover:bg-green-50"
            asChild
          >
            <a
              href={`https://wa.me/5579999999999?text=Olá! Tenho interesse no produto: ${product.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Comprar pelo WhatsApp
            </a>
          </Button>

          <Separator />

          {/* Benefícios */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Truck className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">
                Entrega para todo Brasil
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Compra segura</p>
            </div>
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">
                Embalagem especial
              </p>
            </div>
          </div>

          <Separator />

          {/* Descrição */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
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
          <h2 className="text-2xl font-bold mb-6">Você também pode gostar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct: any) => (
              <Link
                key={relatedProduct.id}
                href={`/produto/${relatedProduct.id}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                  {relatedProduct.images?.[0] ? (
                    <Image
                      src={relatedProduct.images[0].url}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <p className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {relatedProduct.name}
                </p>
                <p className="text-primary font-bold">
                  {formatCurrency(Number(relatedProduct.salePrice))}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
