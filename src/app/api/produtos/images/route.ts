import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveProductImage } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const productId = formData.get('productId') as string;
    const files = formData.getAll('files') as File[];

    if (!productId) {
      return NextResponse.json(
        { error: 'productId é obrigatório' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Limitar a 10 imagens
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Máximo de 10 imagens por vez' },
        { status: 400 }
      );
    }

    // Upload de todas as imagens
    const uploadResults = await Promise.all(
      files.map(file => saveProductImage(file, productId))
    );

    // Verificar se houve erros
    const errors = uploadResults.filter(r => !r.success);
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Erro ao fazer upload de algumas imagens',
          details: errors.map(e => e.error)
        },
        { status: 400 }
      );
    }

    // Retornar URLs das imagens
    const urls = uploadResults.map(r => r.url);

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error('Erro no upload de imagens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
