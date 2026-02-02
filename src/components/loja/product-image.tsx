'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
}

export function ProductImage({ src, alt, fill, className, priority, sizes }: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = imageError || !src ? '/placeholder.svg' : src

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized={imageUrl === '/placeholder.svg'}
      onError={() => setImageError(true)}
    />
  )
}
