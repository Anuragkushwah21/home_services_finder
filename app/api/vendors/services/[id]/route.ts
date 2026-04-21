import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Service from '@/lib/models/Service';
import Vendor from '@/lib/models/Vendor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;

    await connectDB();

    // Get vendor
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    // Get service
    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (service.vendorId.toString() !== vendor._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Update service
    if (categoryId !== undefined) service.categoryId = categoryId;
    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (serviceType !== undefined) service.serviceType = serviceType;
    if (basePrice !== undefined) service.basePrice = basePrice;
    if (priceUnit !== undefined) service.priceUnit = priceUnit;
    if (durationMinutes !== undefined) service.durationMinutes = durationMinutes;
    if (tags !== undefined) service.tags = tags;

    await service.save();

    return NextResponse.json({
      success: true,
      data: service,
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

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'vendor') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await connectDB();

    // Get vendor
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    // Get service
    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (service.vendorId.toString() !== vendor._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Delete service
    await Service.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: 'Service deleted',
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