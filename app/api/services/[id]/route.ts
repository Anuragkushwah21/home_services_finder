import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Service from '@/lib/models/Service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    // 👇 await params first
    const { id } = await params;

    const service = await Service.findById(id)
      .populate(
        'vendorId',
        'businessName description rating workingHours shopAddress city experienceYears phone'
      )
      .populate('categoryId', 'name icon type');

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}