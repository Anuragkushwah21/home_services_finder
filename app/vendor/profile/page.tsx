'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function VendorProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    city: '',
    serviceRadiusKm: 10,
    shopAddress: '',
    experienceYears: 1,
    workingHours: '09:00-18:00',
  });

  // Load basic user info / city default
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    // Optional: take city from localStorage if you store it there
    const userStr = typeof window !== 'undefined'
      ? localStorage.getItem('user')
      : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.city) {
          setFormData(prev => ({ ...prev, city: user.city }));
        }
      } catch {
        // ignore parse error
      }
    }

    setPageLoading(false);
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'serviceRadiusKm' || name === 'experienceYears'
          ? parseInt(value || '0', 10)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!session?.user?.email) {
      setError('You must be logged in to complete your profile');
      return;
    }

    setLoading(true);

    try {
      // Validation
      if (!formData.businessName.trim()) throw new Error('Business name is required');
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!formData.shopAddress.trim()) throw new Error('Shop address is required');
      if (!formData.city.trim()) throw new Error('City is required');
      if (formData.experienceYears < 0) throw new Error('Experience years cannot be negative');
      if (formData.serviceRadiusKm < 1)
        throw new Error('Service radius must be at least 1 km');

      const response = await fetch('/api/vendor-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': String(session.user.email),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setSuccess('Profile completed successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/vendor/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || pageLoading) {
    return (
      <div>
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Tell us about your business so customers can find you
            </p>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sm mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your Business Name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">City *</label>
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
              </div>

              <div>
                <label className="block font-bold text-sm mb-2">
                  Business Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field min-h-[120px]"
                  placeholder="Describe your business, services, and what makes you special..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sm mb-2">
                    Shop Address *
                  </label>
                  <input
                    type="text"
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    Service Radius (km) *
                  </label>
                  <input
                    type="number"
                    name="serviceRadiusKm"
                    value={formData.serviceRadiusKm}
                    onChange={handleChange}
                    className="input-field"
                    min={1}
                    max={100}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sm mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="input-field"
                    min={0}
                    max={60}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm mb-2">
                    Working Hours *
                  </label>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="09:00-18:00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: HH:MM-HH:MM (e.g., 09:00-18:00)
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Saving Profile...
                    </>
                  ) : (
                    'Save & Continue'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Next Steps</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Complete your profile (you are here)</li>
              <li>2. Go to Services to add your services</li>
              <li>3. Start receiving bookings from customers!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}