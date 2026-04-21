import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/lib/models/User';
import Vendor from '@/lib/models/Vendor';
import Booking from '@/lib/models/Booking';
import Service from '@/lib/models/Service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const verifiedVendors = await Vendor.countDocuments({ isVerified: true });
    const pendingVendors = await Vendor.countDocuments({ isVerified: false });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({
      status: 'completed',
    });
    const totalServices = await Service.countDocuments({ isActive: true });

    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        users: totalUsers,
        vendors: {
          total: totalVendors,
          verified: verifiedVendors,
          pending: pendingVendors,
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
        },
        services: totalServices,
        revenue: totalRevenue,
      },
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