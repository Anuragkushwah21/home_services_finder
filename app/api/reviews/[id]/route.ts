import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Review from '@/lib/models/Review';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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
      _id: id,
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

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review id is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.findById(id)
      .populate('userId', 'name email')
      .populate('serviceId', 'name');

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (err) {
    console.error('Error fetching review:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}