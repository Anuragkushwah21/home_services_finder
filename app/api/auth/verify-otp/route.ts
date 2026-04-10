import { connectDB } from '@/lib/db';
import OTP from '@/lib/models/OTP';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
// import { signIn } from 'next-auth/react';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code,
      isUsed: false,
    });

    if (!otpRecord) {
      // Increment attempts
      const failedOTP = await OTP.findOne({
        email: email.toLowerCase(),
        isUsed: false,
      });

      if (failedOTP) {
        failedOTP.attempts += 1;
        await failedOTP.save();

        if (failedOTP.attempts >= 5) {
          await OTP.deleteOne({ _id: failedOTP._id });
          return NextResponse.json(
            { error: 'Too many failed attempts. Please request a new OTP.' },
            { status: 429 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Verify user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return success - client will handle sign-in
    return NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
