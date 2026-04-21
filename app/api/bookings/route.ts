// app/api/bookings/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Service from '@/lib/models/Service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      serviceId,
      bookingType,
      bookingDate,
      bookingTime,
      address,
      notes,
    } = await req.json();

    // Validation
    if (!serviceId || !bookingType || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (bookingType === 'home' && !address) {
      return NextResponse.json(
        {
          success: false,
          error: 'Address required for home service',
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Create booking
    const booking = new Booking({
      userId: (session.user as any).id,
      serviceId,
      vendorId: service.vendorId,
      bookingType,
      bookingDate: new Date(bookingDate),
      bookingTime,
      address: bookingType === 'home' ? address : { addressLine: '' },
      notes: notes || '',
      status: 'pending',
      price: service.basePrice,
      paymentStatus: 'unpaid',
    });

    await booking.save();

    return NextResponse.json(
      {
        success: true,
        data: booking,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const bookings = await Booking.find({ userId: (session.user as any).id })
      .populate('serviceId')
      .populate('vendorId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}