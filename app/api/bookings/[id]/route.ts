import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params; // Fixed: use 'id' consistently

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id); // Fixed: use 'id'

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole === 'customer' && booking.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Allow customers to cancel
    if (userRole === 'customer') {
      if (status !== 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'Customers can only cancel bookings' },
          { status: 400 }
        );
      }
    }

    booking.status = status;
    await booking.save();

    return NextResponse.json({
      success: true,
      data: booking,
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

export async function POST(
  req: NextRequest,
  context: RouteContext // Fixed: use RouteContext (params as Promise)
) {
  try {
    const { id } = await context.params; // Fixed: await params

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rating } = await req.json();
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: id, // Fixed: use 'id'
      userId: session.user.id,
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'You can rate only completed bookings' },
        { status: 400 }
      );
    }

    booking.rating = rating;
    await booking.save();

    // TODO: optionally update service/vendor average rating here

    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    console.error('Error saving rating:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}