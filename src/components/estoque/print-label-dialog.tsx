'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ProductLabel } from './product-label';

interface PrintLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    name: string;
    barcode: string;
    salePrice: number;
  } | null;
}

export function PrintLabelDialog({
  open,
  onOpenChange,
  product,
}: PrintLabelDialogProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product || !product.barcode) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir Etiqueta</DialogTitle>
          <DialogDescription>
            Configure e imprima etiquetas para {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade de etiquetas</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <ProductLabel
            product={product}
            quantity={quantity}
            showPrintButton
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
