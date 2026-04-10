// app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Service from '@/lib/models/Service';
import Vendor from '@/lib/models/Vendor';
import Review from '@/lib/models/Review';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const city = searchParams.get('city');
    const categoryId = searchParams.get('categoryId');
    const serviceType = searchParams.get('serviceType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    await connectDB();

    // Build filter
    const filter: any = { isActive: true };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (serviceType && serviceType !== 'all') {
      filter.serviceType = { $in: [serviceType, 'both'] };
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = parseInt(minPrice, 10);
      if (maxPrice) filter.basePrice.$lte = parseInt(maxPrice, 10);
    }

    // Get verified vendors (optional city filter)
    let vendorIds: string[] = [];
    if (city) {
      const vendors = await Vendor.find({ city, isVerified: true }).select('_id');
      vendorIds = vendors.map((v) => v._id.toString());
    }

    if (vendorIds.length > 0) {
      filter.vendorId = { $in: vendorIds };
    }

    const skip = (page - 1) * limit;

    const services = await Service.find(filter)
      .populate('vendorId', 'businessName city phone experienceYears')
      .populate('categoryId', 'name icon')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Service.countDocuments(filter);

    // ---- Reviews summary per service ----
    const serviceIds = services.map((s: any) => s._id);

    const reviews = await Review.aggregate([
      {
        $match: {
          serviceId: { $in: serviceIds },
        },
      },
      {
        $group: {
          _id: '$serviceId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const reviewMap = new Map<
      string,
      { averageRating: number; totalReviews: number }
    >();

    reviews.forEach((r: any) => {
      reviewMap.set(String(r._id), {
        averageRating: r.averageRating,
        totalReviews: r.totalReviews,
      });
    });

    const servicesWithReviews = services.map((s: any) => {
      const summary = reviewMap.get(String(s._id)) || {
        averageRating: s.rating || 0,
        totalReviews: 0,
      };
      return {
        ...s,
        averageRating: summary.averageRating || 0,
        totalReviews: summary.totalReviews || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: servicesWithReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
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