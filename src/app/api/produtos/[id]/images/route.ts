import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar todas as imagens do produto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const images = await prisma.productImage.findMany({
      where: { productId: params.id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar imagens' },
      { status: 500 }
    );
  }
}

// POST - Adicionar imagens ao produto
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs de imagens são obrigatórias' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Pegar a maior ordem atual
    const maxOrder = product.images.length > 0
      ? Math.max(...product.images.map(img => img.order))
      : -1;

    // Criar registros de imagem
    const images = await Promise.all(
      urls.map((url, index) =>
        prisma.productImage.create({
          data: {
            productId: params.id,
            url,
            alt: product.name,
            order: maxOrder + index + 1
          }
        })
      )
    );

    return NextResponse.json({ images }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar imagens:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar imagens' },
      { status: 500 }
    );
  }
}

// PUT - Reordenar imagens
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { imageOrders } = body; // Array de { id: string, order: number }

    if (!imageOrders || !Array.isArray(imageOrders)) {
      return NextResponse.json(
        { error: 'imageOrders é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar ordem de cada imagem
    await Promise.all(
      imageOrders.map(({ id, order }) =>
        prisma.productImage.update({
          where: { id },
          data: { order }
        })
      )
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao reordenar imagens:', error);
    return NextResponse.json(
      { error: 'Erro ao reordenar imagens' },
      { status: 500 }
    );
  }
}
