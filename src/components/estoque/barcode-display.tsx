'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeDisplayProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
}

export function BarcodeDisplay({
  value,
  width = 2,
  height = 50,
  displayValue = true,
  fontSize = 14,
  className = '',
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: 'EAN13',
          width,
          height,
          displayValue,
          fontSize,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (error) {
        console.error('Erro ao gerar código de barras:', error);
      }
    }
  }, [value, width, height, displayValue, fontSize]);

  if (!value || value.length !== 13) {
    return (
      <div className="text-sm text-muted-foreground">
        Código de barras inválido
      </div>
    );
  }

  return <canvas ref={canvasRef} className={className} />;
}
