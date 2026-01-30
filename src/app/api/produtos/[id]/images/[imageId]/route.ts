import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteProductImage } from '@/lib/upload';

// DELETE - Remover imagem específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar a imagem
    const image = await prisma.productImage.findUnique({
      where: { id: params.imageId }
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a imagem pertence ao produto
    if (image.productId !== params.id) {
      return NextResponse.json(
        { error: 'Imagem não pertence a este produto' },
        { status: 403 }
      );
    }

    // Deletar do filesystem
    await deleteProductImage(image.url);

    // Deletar do banco
    await prisma.productImage.delete({
      where: { id: params.imageId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar imagem' },
      { status: 500 }
    );
  }
}
