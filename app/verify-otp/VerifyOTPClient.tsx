// app/verify-otp/VerifyOTPClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import Link from 'next/link';

export default function VerifyOTPClient({ email }: { email: string }) {
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (otp.length !== 6) {
        throw new Error('Please enter a 6-digit code');
      }

      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Invalid OTP');
      }

      const verifyUserResponse = await fetch('/api/users/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!verifyUserResponse.ok) {
        const verifyUserData = await verifyUserResponse.json();
        throw new Error(verifyUserData.error || 'Failed to verify email');
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              {success ? 'Email Verified!' : 'Verify Email'}
            </h1>
            <p className="text-gray-600">
              {success
                ? 'Your email has been verified successfully!'
                : 'Enter the 6-digit code sent to your email'}
            </p>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {!success ? (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    Verification code sent to <strong>{email}</strong>
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    Enter Code *
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className="input-field text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Code expires in 10 minutes
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="w-full btn btn-ghost disabled:opacity-50"
                >
                  {resendTimer > 0
                    ? `Resend Code in ${resendTimer}s`
                    : 'Resend Code'}
                </button>

                <Link
                  href="/signup"
                  className="block text-center text-sm text-primary font-bold hover:underline"
                >
                  Back to Sign Up
                </Link>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Email Verified!</h3>
                <p className="text-gray-600 mb-4">Redirecting to login...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}