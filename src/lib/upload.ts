import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'produtos');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 85;

export interface UploadResult {
  url: string;
  success: boolean;
  error?: string;
}

/**
 * Valida um arquivo de imagem
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Use: ${ALLOWED_TYPES.join(', ')}`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
}

/**
 * Otimiza uma imagem usando Sharp
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  // Dynamic import to avoid build-time errors on ARM64
  const sharp = (await import('sharp')).default;

  return await sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: QUALITY })
    .toBuffer();
}

/**
 * Salva uma imagem de produto no filesystem
 */
export async function saveProductImage(
  file: File,
  productId: string
): Promise<UploadResult> {
  try {
    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        url: '',
        error: validation.error
      };
    }

    // Criar diretório do produto se não existir
    const productDir = path.join(UPLOAD_DIR, productId);
    if (!existsSync(productDir)) {
      await mkdir(productDir, { recursive: true });
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Otimizar imagem
    const optimizedBuffer = await optimizeImage(buffer);

    // Gerar nome único do arquivo
    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(productDir, filename);

    // Salvar arquivo
    await writeFile(filepath, optimizedBuffer);

    // Retornar URL relativa - use API route for standalone compatibility
    const url = `/api/uploads/produtos/${productId}/${filename}`;

    return {
      success: true,
      url
    };
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Erro ao salvar imagem'
    };
  }
}

/**
 * Remove uma imagem do filesystem
 */
export async function deleteProductImage(imagePath: string): Promise<boolean> {
  try {
    // imagePath vem como /api/uploads/produtos/[id]/[filename] ou /uploads/produtos/[id]/[filename]
    const cleanPath = imagePath.replace('/api/uploads/', '/uploads/')
    const filepath = path.join(process.cwd(), 'public', cleanPath);

    if (existsSync(filepath)) {
      await unlink(filepath);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return false;
  }
}

/**
 * Remove todas as imagens de um produto
 */
export async function deleteProductImages(productId: string): Promise<void> {
  try {
    const productDir = path.join(UPLOAD_DIR, productId);

    if (existsSync(productDir)) {
      const { readdir } = await import('fs/promises');
      const files = await readdir(productDir);

      await Promise.all(
        files.map(file =>
          unlink(path.join(productDir, file)).catch(console.error)
        )
      );

      // Remove o diretório vazio
      await import('fs/promises').then(fs => fs.rmdir(productDir).catch(console.error));
    }
  } catch (error) {
    console.error('Erro ao deletar imagens do produto:', error);
  }
}
