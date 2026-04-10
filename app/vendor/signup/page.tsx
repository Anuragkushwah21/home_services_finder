'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/shared/Header';
import Link from 'next/link';

export default function VendorSignupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    city: '',
    serviceRadiusKm: '10',
    shopAddress: '',
    experienceYears: '',
    workingHours: '09:00-18:00',
  });

  if (!session) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-display font-bold mb-4">
              Vendor Registration
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign up as a customer first
            </p>
            <Link href="/signup?role=vendor" className="btn btn-primary w-full">
              Sign Up as Vendor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.businessName || !formData.description || !formData.city || !formData.shopAddress || !formData.experienceYears) {
        throw new Error('All fields are required');
      }

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create vendor profile');
      }

      router.push('/vendor/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              Complete Your Vendor Profile
            </h1>
            <p className="text-gray-600">
              Tell us about your business to start accepting bookings
            </p>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block font-bold text-sm mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g., ABC Plumbing Services"
                  className="input-field"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-sm mb-2">
                  Business Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your business, experience, and specialties"
                  className="input-field resize-none h-24"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block font-bold text-sm mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Bangalore"
                  className="input-field"
                  required
                />
              </div>

              {/* Service Radius */}
              <div>
                <label className="block font-bold text-sm mb-2">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  name="serviceRadiusKm"
                  value={formData.serviceRadiusKm}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="input-field"
                />
              </div>

              {/* Shop Address */}
              <div>
                <label className="block font-bold text-sm mb-2">
                  Shop Address *
                </label>
                <textarea
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  placeholder="Complete shop address"
                  className="input-field resize-none h-20"
                  required
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block font-bold text-sm mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  min="0"
                  max="70"
                  placeholder="e.g., 5"
                  className="input-field"
                  required
                />
              </div>

              {/* Working Hours */}
              <div>
                <label className="block font-bold text-sm mb-2">
                  Working Hours
                </label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleChange}
                  placeholder="e.g., 09:00-18:00"
                  className="input-field"
                />
              </div>

              {/* Submit */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {loading ? 'Creating Profile...' : 'Create Vendor Profile'}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Your profile will be reviewed and approved by our admin team
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
