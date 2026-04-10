// app/api/vendors/me/route.ts  (App Router)
// or pages/api/vendors/me.ts   (Pages Router, see note below)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Vendor from '@/lib/models/Vendor'; // adjust path/model name

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find vendor linked to this user
    const vendor = await Vendor.findOne({ userId: session.user.id });

    if (!vendor) {
      return NextResponse.json(
        { success: true, vendor: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        vendor: {
          id: vendor._id.toString(),
          isVerified: vendor.isVerified,
          businessName: vendor.businessName,
          city: vendor.city,
          // add other fields if needed
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching vendor status:', error);
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