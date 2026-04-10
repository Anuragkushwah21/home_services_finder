import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Vendor from '@/lib/models/Vendor';
import Booking from '@/lib/models/Booking';

export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVendors = await Vendor.countDocuments({});

    const completed = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$amount' },
          cost: { $sum: '$cost' },
        },
      },
    ]);

    const revenue = completed[0]?.revenue || 0;
    const cost = completed[0]?.cost || 0;
    const profit = revenue - cost;
    const loss = cost > revenue ? cost - revenue : 0;

    return NextResponse.json({
      success: true,
      data: { totalUsers, totalVendors, revenue, profit, loss },
    });
  } catch (err) {
    console.error('Summary error', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}