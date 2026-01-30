'use client';

import { useState, useRef, DragEvent } from 'react';
import Image from 'next/image';
import { X, Upload, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ImageData {
  id: string;
  url: string;
  file?: File;
  order: number;
}

interface ImageUploadProps {
  productId?: string;
  initialImages?: ImageData[];
  onChange: (images: ImageData[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  productId,
  initialImages = [],
  onChange,
  maxImages = 10
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImages = (newImages: ImageData[]) => {
    setImages(newImages);
    onChange(newImages);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newImages: ImageData[] = filesToAdd.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      order: images.length + index
    }));

    updateImages([...images, ...newImages]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }));
    updateImages(newImages);
  };

  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];

    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      order: i
    }));

    setImages(reorderedImages);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    onChange(images);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {images.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFilePicker}
          className={cn(
            'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
            isDraggingOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste imagens aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP até 5MB (máx. {maxImages} imagens)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleImageDragStart(index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
                className={cn(
                  'relative group rounded-lg overflow-hidden border-2 cursor-move transition-all',
                  index === 0
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border',
                  draggedIndex === index && 'opacity-50'
                )}
              >
                <div className="aspect-square relative bg-muted">
                  <Image
                    src={image.url}
                    alt={`Imagem ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                    Principal
                  </div>
                )}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-background/80 backdrop-blur-sm rounded p-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {images.length < maxImages && (
            <Button
              type="button"
              variant="outline"
              onClick={openFilePicker}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Adicionar mais imagens ({images.length}/{maxImages})
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Arraste as imagens para reordenar. A primeira imagem será a principal.
          </p>
        </div>
      )}
    </div>
  );
}
