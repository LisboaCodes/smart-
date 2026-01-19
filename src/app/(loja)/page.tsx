import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedStoreProducts, getStoreProducts, getStoreCategoriesWithCount } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Sparkles } from 'lucide-react'

function ProductCard({ product }: { product: any }) {
  const imageUrl = product.imageUrl || '/placeholder.jpg'
  const hasPromo = product.promoPrice && new Date() <= new Date(product.promoEndDate)
  const price = hasPromo ? product.promoPrice : product.salePrice

  return (
    <Card className="group overflow-hidden">
      <Link href={`/produto/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}
          {hasPromo && (
            <Badge className="absolute top-2 left-2 bg-red-500">Promoção</Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/produto/${product.id}`}>
          <p className="text-xs text-muted-foreground mb-1">
            {product.categoryName}
          </p>
          <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(Number(price))}
            </span>
            {hasPromo && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(Number(product.salePrice))}
              </span>
            )}
          </div>
        </Link>
        <Button className="w-full mt-3" size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CardContent>
    </Card>
  )
}

function ProductsGrid({ products }: { products: any[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function LojaPage({
  searchParams,
}: {
  searchParams: { categoria?: string; busca?: string }
}) {
  const [featured, products, categories] = await Promise.all([
    getFeaturedStoreProducts(),
    getStoreProducts(searchParams.categoria),
    getStoreCategoriesWithCount(),
  ])

  return (
    <div className="container py-8">
      {/* Hero */}
      {!searchParams.categoria && (
        <section className="mb-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 to-pink-600 p-8 md:p-12 text-white">
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Brilhe com Smart+ Acessórios
              </h1>
              <p className="text-lg opacity-90 mb-6">
                Descubra nossa coleção de bolsas, joias, semi-joias e bijuterias.
                Qualidade e estilo que você merece!
              </p>
              <Button size="lg" variant="secondary">
                Ver Novidades
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="mb-8">
        <div className="flex gap-2 flex-wrap">
          <Link href="/">
            <Badge
              variant={!searchParams.categoria ? 'default' : 'outline'}
              className="cursor-pointer text-sm py-1 px-3"
            >
              Todos
            </Badge>
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/?categoria=${cat.name.toLowerCase()}`}
            >
              <Badge
                variant={
                  searchParams.categoria?.toLowerCase() === cat.name.toLowerCase()
                    ? 'default'
                    : 'outline'
                }
                className="cursor-pointer text-sm py-1 px-3"
              >
                {cat.name} ({cat.productCount})
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Destaques */}
      {!searchParams.categoria && featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Destaques
          </h2>
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsGrid products={featured} />
          </Suspense>
        </section>
      )}

      {/* Produtos */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          {searchParams.categoria
            ? `${searchParams.categoria.charAt(0).toUpperCase()}${searchParams.categoria.slice(1)}`
            : 'Todos os Produtos'}
        </h2>
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsGrid products={products} />
        </Suspense>
      </section>
    </div>
  )
}
