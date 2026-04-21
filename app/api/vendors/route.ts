// app/api/vendors/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);

    if (!session || !(session as any).user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session as any).user.id;

    const {
      businessName,
      description,
      city,
      serviceRadiusKm,
      shopAddress,
      experienceYears,
      workingHours,
    } = await req.json();

    // Validation
    if (!businessName || !description || !city || !shopAddress || !experienceYears) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if vendor already exists for this user
    const existingVendor = await Vendor.findOne({ userId });
    if (existingVendor) {
      return NextResponse.json(
        { success: false, error: 'User already has a vendor profile' },
        { status: 409 }
      );
    }

    // Create vendor profile
    const vendor = new Vendor({
      userId,
      businessName,
      description,
      city,
      serviceRadiusKm: serviceRadiusKm || 10,
      shopAddress,
      experienceYears,
      workingHours: workingHours || '09:00-18:00',
      isVerified: false,
      profileCompleted: true,
    });

    await vendor.save();

    return NextResponse.json(
      {
        success: true,
        data: vendor,
      },
      { status: 201 }
    );
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

// GET same as before, but with (session as any).user or optional chaining
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);

    // Only admins allowed
    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const verified = searchParams.get('verified'); // 'true' | 'false' | null

    await connectDB();

    // 1) Find all users with role "vendor"
    const vendorUsers = await User.find({ role: 'vendor' }, '_id').lean();
    const vendorUserIds = vendorUsers.map((u) => u._id);
    console.log('vendor user', vendorUserIds);

    // 2) Build vendor filter
    const filter: any = { userId: { $in: vendorUserIds } };
    if (verified === 'true') filter.isVerified = true;
    if (verified === 'false') filter.isVerified = false;

    // 3) Find vendors for those users
    const vendors = await Vendor.find(filter)
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: vendors },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching vendors:', error);
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