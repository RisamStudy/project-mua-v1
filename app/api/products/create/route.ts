import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, description, price, imageUrl } = body;

    // Validasi input
    if (!name || !category || price === undefined || price === null) {
      return NextResponse.json(
        { message: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    // Validasi price
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      return NextResponse.json(
        { message: 'Price must be a valid positive number' },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        description: description ? description.trim() : null,
        price: new Decimal(priceNumber),
        imageUrl: imageUrl || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: product.id,
        name: product.name,
        category: product.category,
      },
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'A product with this name already exists' },
        { status: 400 }
      );
    }

    if (error.message?.includes('Can\'t reach database')) {
      return NextResponse.json(
        { message: 'Database connection failed. Please ensure database is running.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        message: error.message || 'Failed to create product',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}