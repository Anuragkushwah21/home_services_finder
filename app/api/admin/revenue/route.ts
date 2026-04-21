import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';

// GET /api/admin/revenue?range=weekly|monthly|yearly
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = (searchParams.get('range') || 'monthly') as
      | 'weekly'
      | 'monthly'
      | 'yearly';

    const dateField = '$createdAt';

    let groupId: any;
    let labelExpr: any;

    if (range === 'weekly') {
      groupId = {
        year: { $year: dateField },
        week: { $isoWeek: dateField },
      };
      labelExpr = {
        $concat: [
          { $toString: '$_id.year' },
          '-W',
          { $toString: '$_id.week' },
        ],
      };
    } else if (range === 'yearly') {
      groupId = {
        year: { $year: dateField },
      };
      labelExpr = { $toString: '$_id.year' };
    } else {
      // monthly
      groupId = {
        year: { $year: dateField },
        month: { $month: dateField },
      };
      labelExpr = {
        $concat: [
          { $toString: '$_id.year' },
          '-',
          {
            $cond: [
              { $lt: ['$_id.month', 10] },
              { $concat: ['0', { $toString: '$_id.month' }] },
              { $toString: '$_id.month' },
            ],
          },
        ],
      };
    }

    const pipeline: any[] = [
      {
        $match: {
          status: 'completed',
          createdAt: { $type: 'date' }, // ensure it's a date, avoids operator errors
        },
      },
      {
        $group: {
          _id: groupId,
          totalAmount: { $sum: '$amount' },
          bookingCount: { $sum: 1 },
          userSet: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          _id: 0,
          label: labelExpr,
          amount: '$totalAmount',
          count: '$bookingCount',
          users: { $size: '$userSet' },
        },
      },
      { $sort: { label: 1 } },
    ];

    const result = await Booking.aggregate(pipeline);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/admin/revenue:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}