import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Review from '@/lib/models/Review';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { bookingId, serviceId, vendorId, rating, comment } = await req.json();

    if (!bookingId || !serviceId || !vendorId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Can only review completed bookings' },
        { status: 400 }
      );
    }

    const existingReview = await Review.findOne({
      bookingId,
      userId: user._id,
    });
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this booking' },
        { status: 409 }
      );
    }

    const review = new Review({
      bookingId,
      serviceId,
      vendorId,
      userId: user._id,
      rating,
      comment: comment || '',
    });

    await review.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully',
        data: review,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating review:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const serviceId = searchParams.get('serviceId');
    const bookingId = searchParams.get('bookingId');

    await connectDB();

    const query: any = {};
    if (vendorId) query.vendorId = vendorId;
    if (serviceId) query.serviceId = serviceId;
    if (bookingId) query.bookingId = bookingId;

    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: {
        totalReviews,
        averageRating,
      },
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}