import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Service from '@/lib/models/Service';
import Vendor from '@/lib/models/Vendor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'vendor') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get vendor by user ID
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    // Get vendor's services
    const services = await Service.find({ vendorId: vendor._id })
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'vendor') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      categoryId,
      name,
      description,
      serviceType,
      basePrice,
      priceUnit,
      durationMinutes,
      tags,
    } = await req.json();

    // Validation
    if (!categoryId || !name || !description || !serviceType || !basePrice || !durationMinutes) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['home', 'shop', 'both'].includes(serviceType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service type' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get vendor by user ID
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    // Create service
    const service = new Service({
      vendorId: vendor._id,
      categoryId,
      name,
      description,
      serviceType,
      basePrice,
      priceUnit: priceUnit || 'per service',
      durationMinutes,
      tags: tags || [],
      isActive: true,
    });

    await service.save();

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
