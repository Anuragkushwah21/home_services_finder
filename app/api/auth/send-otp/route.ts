import { connectDB } from '@/lib/db';
import OTP from '@/lib/models/OTP';
import User from '@/lib/models/User';
import { sendOTPEmail, generateOTP } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 404 }
      );
    }

    await OTP.deleteMany({
      email: email.toLowerCase(),
      isUsed: false,
    });

    const code = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      email: email.toLowerCase(),
      code,
      expiresAt,
    });

    await sendOTPEmail(email, code);

    return NextResponse.json(
      { 
        success: true,
        message: 'OTP sent successfully to your email',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}