'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import Link from 'next/link';
import { toast } from 'react-toastify';

type SignupStep = 'form' | 'success';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<SignupStep>('form');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    city: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      phone: digits,
    }));
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validations
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.password) throw new Error('Password is required');
      if (!formData.confirmPassword)
        throw new Error('Confirm password is required');
      if (formData.password !== formData.confirmPassword)
        throw new Error('Passwords do not match');
      if (formData.password.length < 6)
        throw new Error('Password must be at least 6 characters');
      if (!formData.phone.trim()) throw new Error('Phone is required');
      if (!formData.city.trim()) throw new Error('City is required');

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Phone number must be exactly 10 digits');
      }

      // Check if user already exists
      const checkResponse = await fetch(
        '/api/users?email=' + encodeURIComponent(formData.email),
      );
      const checkData = await checkResponse.json();
      if (checkData.exists) {
        throw new Error('Email already registered. Please login instead.');
      }

      // Create user
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          city: formData.city,
        }),
      });

      const createData = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create account');
      }

      // Send OTP email
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      // Success
      setStep('success');
      toast.success('Account created! Please verify your email.');
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              {step === 'form' ? 'Create Account' : 'Welcome!'}
            </h1>
            <p className="text-gray-600">
              {step === 'form'
                ? 'Sign up to start booking or offering services'
                : 'Account created successfully! Redirecting to email verification...'}
            </p>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block font-bold text-sm mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Repeat your password"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="input-field"
                    placeholder="1234567890"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d{10}"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Mumbai"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    Account Type *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="user">User (Book Services)</option>
                    <option value="vendor">
                      Service Provider (Offer Services)
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </button>
              </form>
            )}

            {step === 'success' && (
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
                <h3 className="text-lg font-bold mb-2">Account Created!</h3>
                <p className="text-gray-600 mb-4">
                  Your account has been created. Please verify your email to
                  continue.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to verification page...
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-bold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}