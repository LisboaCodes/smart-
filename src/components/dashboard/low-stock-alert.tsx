import Link from 'next/link'
import { getLowStockProducts } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'

export async function LowStockAlert() {
  const products = await getLowStockProducts(10, 10)

  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum produto com estoque baixo
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-center">Estoque</TableHead>
            <TableHead className="text-center">Mínimo</TableHead>
            <TableHead>Preço</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product: any) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category?.name}</TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    product.stock === 0
                      ? 'destructive'
                      : product.stock <= product.minStock
                      ? 'secondary'
                      : 'secondary'
                  }
                  className={
                    product.stock === 0
                      ? ''
                      : product.stock <= product.minStock
                      ? 'bg-yellow-100 text-yellow-800'
                      : ''
                  }
                >
                  {product.stock}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {product.minStock}
              </TableCell>
              <TableCell>{formatCurrency(Number(product.salePrice))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/estoque?filter=low">Ver todos</Link>
        </Button>
      </div>
    </div>
  )
}
