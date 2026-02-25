import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 85;

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'creativenext';
const S3_REGION = process.env.AWS_REGION || 'us-east-1';

const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

function getPublicUrl(key: string): string {
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

export interface UploadResult {
  url: string;
  success: boolean;
  error?: string;
}

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

export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  return await sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: QUALITY })
    .toBuffer();
}

export async function saveProductImage(
  file: File,
  productId: string
): Promise<UploadResult> {
  try {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, url: '', error: validation.error };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const optimizedBuffer = await optimizeImage(buffer);

    const filename = `${uuidv4()}.webp`;
    const key = `produtos/${productId}/${filename}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: optimizedBuffer,
      ContentType: 'image/webp',
    }));

    const url = getPublicUrl(key);

    return { success: true, url };
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Erro ao salvar imagem'
    };
  }
}

export async function deleteProductImage(imagePath: string): Promise<boolean> {
  try {
    // Extrair a key do S3 a partir da URL
    let key = imagePath;

    // Se for URL completa do S3, extrair o path
    if (imagePath.includes('.amazonaws.com/')) {
      key = imagePath.split('.amazonaws.com/')[1];
    }
    // Se for URL antiga do filesystem, converter para key S3
    else if (imagePath.startsWith('/api/uploads/')) {
      key = imagePath.replace('/api/uploads/', '');
    } else if (imagePath.startsWith('/uploads/')) {
      key = imagePath.replace('/uploads/', '');
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));

    return true;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return false;
  }
}

export async function deleteProductImages(productId: string): Promise<void> {
  try {
    const prefix = `produtos/${productId}/`;

    const listResult = await s3Client.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
    }));

    if (!listResult.Contents || listResult.Contents.length === 0) return;

    await s3Client.send(new DeleteObjectsCommand({
      Bucket: S3_BUCKET,
      Delete: {
        Objects: listResult.Contents.map(obj => ({ Key: obj.Key })),
      },
    }));
  } catch (error) {
    console.error('Erro ao deletar imagens do produto:', error);
  }
}
