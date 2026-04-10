import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any)?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    await connectDB();

    const bookings = await Booking.find({ userId })
      .populate('serviceId', 'name')
      .populate('vendorId', 'name businessName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { data: bookings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}