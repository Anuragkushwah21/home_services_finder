import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { validateEmail, validatePhone } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, role = 'user', city } = await req.json();

    // Validation
    if (!name || !email || !password || !phone || !city) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
      city,
      emailVerified: false,
      profileCompleted: false,
      addresses: [],
    });

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');

    await connectDB();

    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      // Return exists flag for signup validation
      if (!user) {
        return NextResponse.json({
          success: true,
          exists: false,
        });
      }

      return NextResponse.json({
        success: true,
        exists: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          city: user.city,
          profileCompleted: user.profileCompleted,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Email parameter required' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
