import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const email = req.headers.get('x-user-email');
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const vendor = await Vendor.findOne({ userId: user._id });

    if (!vendor) {
      return NextResponse.json(
        { success: true, vendor: null, profileCompleted: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        vendor,
        profileCompleted: vendor.profileCompleted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendor profile' },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const {
      businessName,
      description,
      city,
      serviceRadiusKm,
      shopAddress,
      experienceYears,
      workingHours,
    } = await req.json();

    // Basic validation
    if (!businessName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Business name is required' },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!shopAddress?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Shop address is required' },
        { status: 400 }
      );
    }

    if (!city?.trim()) {
      return NextResponse.json(
        { success: false, error: 'City is required' },
        { status: 400 }
      );
    }

    const radius = Number(serviceRadiusKm ?? 10);
    const expYears = Number(experienceYears ?? 1);

    if (Number.isNaN(radius) || radius < 1) {
      return NextResponse.json(
        { success: false, error: 'Service radius must be at least 1 km' },
        { status: 400 }
      );
    }

    if (Number.isNaN(expYears) || expYears < 0) {
      return NextResponse.json(
        { success: false, error: 'Experience years cannot be negative' },
        { status: 400 }
      );
    }

    await connectDB();

    const email = req.headers.get('x-user-email');
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let vendor = await Vendor.findOne({ userId: user._id });

    if (vendor) {
      vendor.businessName = businessName;
      vendor.description = description;
      vendor.city = city;
      vendor.serviceRadiusKm = radius;
      vendor.shopAddress = shopAddress;
      vendor.experienceYears = expYears;
      vendor.workingHours = workingHours || '09:00-18:00';
      vendor.profileCompleted = true;
    } else {
      vendor = new Vendor({
        userId: user._id,
        businessName,
        description,
        city,
        serviceRadiusKm: radius,
        shopAddress,
        experienceYears: expYears,
        workingHours: workingHours || '09:00-18:00',
        profileCompleted: true,
      });
    }

    await vendor.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Vendor profile saved successfully',
        vendor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving vendor profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save vendor profile' },
      { status: 500 }
    );
  }
}