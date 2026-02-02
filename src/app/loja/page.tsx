import { Suspense } from 'react'
import Link from 'next/link'
import { getFeaturedStoreProducts, getStoreProducts, getStoreCategoriesWithCount } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/loja/product-card'
import { SearchBar } from '@/components/loja/search-bar'
import { Sparkles } from 'lucide-react'

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
        <Card key={i} className="overflow-hidden border-gold-200">
          <Skeleton className="aspect-square bg-gradient-to-br from-gold-50 to-gold-100" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-3 w-16 bg-gold-100" />
            <Skeleton className="h-4 w-full bg-gold-100" />
            <Skeleton className="h-6 w-24 bg-gold-200" />
            <Skeleton className="h-9 w-full bg-gold-100" />
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
    getStoreProducts(searchParams.categoria, searchParams.busca),
    getStoreCategoriesWithCount(),
  ])

  return (
    <div className="container py-8">
      {/* Hero */}
      {!searchParams.categoria && (
        <section className="mb-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-black via-zinc-900 to-black p-8 md:p-12 text-white">
            {/* Gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                Brilhe com Smart+ Acessorios
              </h1>
              <p className="text-lg text-gold-100/90 mb-6">
                Descubra nossa colecao de bolsas, joias, semi-joias e bijuterias.
                Qualidade e estilo que voce merece!
              </p>
              <Button size="lg" className="bg-gold-600 hover:bg-gold-700 text-black font-semibold">
                Ver Novidades
              </Button>
            </div>
            {/* Decorative gold elements */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-gold-500/20 to-transparent rounded-full blur-3xl" />
          </div>
        </section>
      )}

      {/* Busca e Categorias */}
      <section className="mb-8 space-y-4">
        <SearchBar />

        {!searchParams.busca && (
          <div className="flex gap-2 flex-wrap">
            <Link href="/loja">
              <Badge
                variant={!searchParams.categoria ? 'default' : 'outline'}
                className={`cursor-pointer text-sm py-1 px-3 ${!searchParams.categoria ? 'bg-gold-600 hover:bg-gold-700' : 'border-gold-400 text-gold-700 hover:bg-gold-50 dark:border-gold-600 dark:text-gold-400 dark:hover:bg-gold-950'}`}
              >
                Todos
              </Badge>
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/loja?categoria=${cat.name.toLowerCase()}`}
              >
                <Badge
                  variant={
                    searchParams.categoria?.toLowerCase() === cat.name.toLowerCase()
                      ? 'default'
                      : 'outline'
                  }
                  className={`cursor-pointer text-sm py-1 px-3 ${searchParams.categoria?.toLowerCase() === cat.name.toLowerCase() ? 'bg-gold-600 hover:bg-gold-700' : 'border-gold-400 text-gold-700 hover:bg-gold-50 dark:border-gold-600 dark:text-gold-400 dark:hover:bg-gold-950'}`}
                >
                  {cat.name} ({cat.productCount})
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Destaques */}
      {!searchParams.categoria && !searchParams.busca && featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-gold-500" />
            <span className="bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">Destaques</span>
          </h2>
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsGrid products={featured} />
          </Suspense>
        </section>
      )}

      {/* Produtos */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gold-800 dark:text-gold-400">
          {searchParams.busca
            ? `Resultados para "${searchParams.busca}"`
            : searchParams.categoria
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
