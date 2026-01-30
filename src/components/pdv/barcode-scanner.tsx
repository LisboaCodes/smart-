'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (open && !hasStartedRef.current) {
      startScanner();
      hasStartedRef.current = true;
    }

    return () => {
      if (!open) {
        stopScanner();
        hasStartedRef.current = false;
      }
    };
  }, [open]);

  const startScanner = async () => {
    try {
      setError(null);
      setScanning(true);

      // Verificar se está em contexto seguro (HTTPS ou localhost)
      const isSecureContext = window.isSecureContext;
      if (!isSecureContext && window.location.hostname !== 'localhost') {
        setError('⚠️ Câmera requer HTTPS. Acesse via https:// ou localhost para usar o scanner.');
        setScanning(false);
        return;
      }

      // Criar instância do scanner
      const scanner = new Html5Qrcode('barcode-reader');
      scannerRef.current = scanner;

      // Obter câmeras disponíveis
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        setError('Nenhuma câmera encontrada no dispositivo. Verifique se permitiu o acesso à câmera.');
        setScanning(false);
        return;
      }

      // Preferir câmera traseira em dispositivos mobile
      const backCamera = devices.find(
        (device) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('traseira') ||
          device.label.toLowerCase().includes('rear')
      );

      const selectedCamera = backCamera || devices[0];
      setCameraId(selectedCamera.id);

      // Configuração do scanner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        aspectRatio: 1.0,
      };

      // Iniciar scanner
      await scanner.start(
        selectedCamera.id,
        config,
        (decodedText, decodedResult) => {
          // Código detectado com sucesso
          console.log('Código detectado:', decodedText);

          // Vibrar se suportado
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }

          // Chamar callback
          onScan(decodedText);

          // Fechar scanner
          stopScanner();
          onOpenChange(false);
        },
        (errorMessage) => {
          // Erro durante scan (normal, enquanto não detecta nada)
          // Não fazer nada aqui
        }
      );

      setScanning(true);
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err);

      if (err instanceof Error) {
        if (err.message.includes('Permission') || err.message.includes('permission')) {
          setError(
            'Permissão de câmera negada.\n\n' +
            '📱 Para permitir:\n' +
            '1. Toque no ícone 🔒 ou ⓘ na barra de endereço\n' +
            '2. Selecione "Permissões do site"\n' +
            '3. Permita o acesso à câmera\n' +
            '4. Recarregue a página'
          );
        } else if (err.message.includes('NotAllowed')) {
          setError(
            'Acesso à câmera bloqueado.\n\n' +
            'Nas configurações do navegador:\n' +
            'Chrome: chrome://settings/content/camera\n' +
            'Permita o acesso para este site.'
          );
        } else {
          setError(err.message);
        }
      } else {
        setError(
          'Erro ao iniciar scanner.\n\n' +
          'Verifique se:\n' +
          '• Está usando HTTPS (ou localhost)\n' +
          '• Permitiu acesso à câmera\n' +
          '• Nenhum outro app está usando a câmera'
        );
      }

      setScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        const isScanning = scannerRef.current.isScanning;

        if (isScanning) {
          await scannerRef.current.stop();
        }

        scannerRef.current.clear();
        scannerRef.current = null;
      }

      setScanning(false);
      setCameraId(null);
    } catch (err) {
      console.error('Erro ao parar scanner:', err);
    }
  };

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner de Código de Barras
          </DialogTitle>
          <DialogDescription>
            Aponte a câmera para o código de barras do produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">
                {error}
                <div className="mt-3">
                  <Button
                    onClick={() => {
                      setError(null);
                      startScanner();
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <div
              id="barcode-reader"
              className="rounded-lg overflow-hidden bg-black"
              style={{ minHeight: '300px' }}
            />

            {!scanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Iniciando câmera...</p>
                </div>
              </div>
            )}

            {scanning && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-sm font-medium">Escaneando...</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Formatos: EAN-13, EAN-8, Code 128, UPC</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4 mr-1" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
