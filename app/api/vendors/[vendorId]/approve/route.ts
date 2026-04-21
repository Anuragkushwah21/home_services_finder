// app/api/vendors/[vendorId]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';

interface RouteContext {
  params: Promise<{ vendorId: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { vendorId } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { approved } = await req.json();

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Approved flag must be boolean' },
        { status: 400 }
      );
    }

    await connectDB();

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    vendor.isVerified = approved;
    await vendor.save();

    return NextResponse.json(
      {
        success: true,
        message: approved
          ? 'Vendor approved successfully'
          : 'Vendor rejected successfully',
        vendor,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error approving/rejecting vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor status' },
      { status: 500 }
    );
  }
}