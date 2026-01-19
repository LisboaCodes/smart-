import Link from 'next/link'
import { query, queryOne } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Store,
  Package,
  Star,
  Eye,
  ExternalLink,
  ShoppingBag,
  Tag,
  TrendingUp
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

async function getStoreStats() {
  const [totalProducts, featuredProducts, totalCategories, productsInStore] = await Promise.all([
    queryOne<{ count: string }>(`
      SELECT COUNT(*) as count FROM smartloja.products WHERE active = true
    `),
    queryOne<{ count: string }>(`
      SELECT COUNT(*) as count FROM smartloja.products
      WHERE active = true AND "showInStore" = true AND featured = true
    `),
    queryOne<{ count: string }>(`
      SELECT COUNT(*) as count FROM smartloja.categories WHERE active = true
    `),
    queryOne<{ count: string }>(`
      SELECT COUNT(*) as count FROM smartloja.products
      WHERE active = true AND "showInStore" = true AND stock > 0
    `),
  ])

  return {
    totalProducts: parseInt(totalProducts?.count || '0'),
    featuredProducts: parseInt(featuredProducts?.count || '0'),
    totalCategories: parseInt(totalCategories?.count || '0'),
    productsInStore: parseInt(productsInStore?.count || '0'),
  }
}

async function getStoreProductsList() {
  return query(`
    SELECT p.id, p.name, p.sku, p."salePrice", p."promoPrice", p."promoEndDate",
           p.stock, p.featured, p."showInStore",
           (SELECT url FROM smartloja.product_images pi WHERE pi."productId" = p.id ORDER BY pi."order" LIMIT 1) as "imageUrl",
           c.name as "categoryName"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p.active = true AND p."showInStore" = true
    ORDER BY p.featured DESC, p."createdAt" DESC
    LIMIT 20
  `)
}

export default async function LojaAdminPage() {
  const [stats, products] = await Promise.all([
    getStoreStats(),
    getStoreProductsList(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loja Virtual</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos exibidos na loja online
          </p>
        </div>
        <Button asChild>
          <a href="/loja" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Loja
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Na Loja</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsInStore}</div>
            <p className="text-xs text-muted-foreground">
              produtos visíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destaques</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredProducts}</div>
            <p className="text-xs text-muted-foreground">
              produtos em destaque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Gerencie os produtos da loja virtual
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/estoque">
              <Package className="h-4 w-4 mr-2" />
              Gerenciar Estoque
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/estoque?showInStore=true">
              <Eye className="h-4 w-4 mr-2" />
              Produtos na Loja
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/estoque?featured=true">
              <Star className="h-4 w-4 mr-2" />
              Produtos em Destaque
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Products in Store */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos na Loja Virtual</CardTitle>
          <CardDescription>
            Produtos atualmente visíveis para os clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto na loja virtual</p>
              <p className="text-sm">
                Ative a opção "Exibir na Loja" nos produtos do estoque
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product: any) => {
                const hasPromo = product.promoPrice && new Date() <= new Date(product.promoEndDate)
                const price = hasPromo ? product.promoPrice : product.salePrice

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          {product.featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Destaque
                            </Badge>
                          )}
                          {hasPromo && (
                            <Badge className="bg-red-500 text-xs">Promoção</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.categoryName} • SKU: {product.sku} • Estoque: {product.stock}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {formatCurrency(Number(price))}
                        </div>
                        {hasPromo && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatCurrency(Number(product.salePrice))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`/loja/produto/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
