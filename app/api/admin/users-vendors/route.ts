import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Vendor from '@/lib/models/Vendor';
import { getDateRange } from '@/lib/dateRange';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const range =
      (searchParams.get('range') as 'weekly' | 'monthly' | 'yearly') ||
      'monthly';

    const { start, end } = getDateRange(range);

    const dateFormat =
      range === 'weekly'
        ? '%Y-%m-%d'
        : range === 'monthly'
        ? '%Y-%m'
        : '%Y';

    const usersAgg = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const vendorsAgg = await Vendor.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const labelsSet = new Set<string>();
    usersAgg.forEach((u) => labelsSet.add(u._id));
    vendorsAgg.forEach((v) => labelsSet.add(v._id));

    const labels = Array.from(labelsSet).sort();
    const usersMap = new Map(usersAgg.map((u) => [u._id, u.count]));
    const vendorsMap = new Map(vendorsAgg.map((v) => [v._id, v.count]));

    const data = labels.map((label) => ({
      label,
      users: usersMap.get(label) || 0,
      vendors: vendorsMap.get(label) || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Users/vendors analytics error', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users/vendors data' },
      { status: 500 }
    );
  }
}