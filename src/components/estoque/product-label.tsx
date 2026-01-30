'use client';

import { useRef } from 'react';
import { BarcodeDisplay } from './barcode-display';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ProductLabelProps {
  product: {
    name: string;
    barcode: string;
    salePrice: number;
  };
  quantity?: number;
  showPrintButton?: boolean;
}

export function ProductLabel({
  product,
  quantity = 1,
  showPrintButton = false,
}: ProductLabelProps) {
  const labelRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) return;

    const labels = Array.from({ length: quantity }, (_, i) => `
      <div class="label">
        <div class="label-content">
          <h2 class="product-name">${product.name}</h2>
          <div class="price">${formatCurrency(product.salePrice)}</div>
          <div class="barcode-container">
            <canvas id="barcode-${i}"></canvas>
          </div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta - ${product.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @page {
              size: 50mm 30mm;
              margin: 0;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
              }

              .label {
                page-break-after: always;
                page-break-inside: avoid;
              }

              .label:last-child {
                page-break-after: auto;
              }
            }

            body {
              font-family: Arial, sans-serif;
              background: white;
            }

            .label {
              width: 50mm;
              height: 30mm;
              padding: 2mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              border: 1px dashed #ccc;
              background: white;
            }

            .label-content {
              width: 100%;
              text-align: center;
            }

            .product-name {
              font-size: 10pt;
              font-weight: bold;
              margin-bottom: 2mm;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              line-height: 1.2;
            }

            .price {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 2mm;
              color: #000;
            }

            .barcode-container {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            canvas {
              max-width: 100%;
              height: auto;
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          ${labels}
          <script>
            // Gerar códigos de barras para todas as etiquetas
            for (let i = 0; i < ${quantity}; i++) {
              const canvas = document.getElementById('barcode-' + i);
              if (canvas) {
                JsBarcode(canvas, '${product.barcode}', {
                  format: 'EAN13',
                  width: 1.5,
                  height: 30,
                  displayValue: true,
                  fontSize: 10,
                  margin: 2,
                });
              }
            }

            // Aguardar renderização e imprimir
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 100);
            }, 500);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Preview da etiqueta */}
      <div
        ref={labelRef}
        className="border-2 border-dashed rounded-lg p-4 bg-white"
        style={{ width: '50mm', margin: '0 auto' }}
      >
        <div className="text-center space-y-2">
          <h3 className="font-bold text-sm line-clamp-2">
            {product.name}
          </h3>
          <div className="text-lg font-bold">
            {formatCurrency(product.salePrice)}
          </div>
          <div className="flex justify-center">
            <BarcodeDisplay
              value={product.barcode}
              width={1.5}
              height={30}
              fontSize={10}
            />
          </div>
        </div>
      </div>

      {/* Botão de impressão */}
      {showPrintButton && (
        <div className="flex items-center gap-2 justify-center">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir {quantity > 1 ? `${quantity} etiquetas` : 'etiqueta'}
          </Button>
        </div>
      )}
    </div>
  );
}
