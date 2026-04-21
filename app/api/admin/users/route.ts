// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Vendor from '@/lib/models/Vendor';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const users = await User.find(
      {},
      'name email role isActive createdAt'
    )
      .sort({ createdAt: -1 })
      .lean();

    const vendors = await Vendor.find()
      .populate('userId', 'name email role isActive')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          users,
          vendors,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin users/vendors:', error);
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