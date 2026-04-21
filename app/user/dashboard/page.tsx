'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';

type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface Booking {
  _id: string;
  status: BookingStatus;
  price: number;
  serviceId?: { name: string };
  vendorId?: { name?: string; businessName?: string };
  date?: string;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wait until NextAuth finishes checking the session
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // Only trigger signIn once and let NextAuth handle redirect
      signIn(undefined, { callbackUrl: '/user/dashboard' });
      return;
    }

    // User is authenticated – now fetch bookings
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/bookings/me', {
        // Important: include credentials so NextAuth session cookie is sent
        credentials: 'include',
      });

      if (res.status === 401) {
        // If API says unauthorized, don’t infinite‑loop, just show message
        setError('You must be logged in to view bookings.');
        setBookings([]);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch bookings');

      const data = await res.json();
      setBookings(data.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter((b) =>
    ['pending', 'accepted', 'in_progress'].includes(b.status)
  ).length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;

  const totalSpent = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const totalCompletedSpent = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const getStatusBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      case 'accepted':
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div>
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">
              Sign in required
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be signed in to view your dashboard.
            </p>
            <button
              onClick={() => signIn(undefined, { callbackUrl: '/user/dashboard' })}
              className="btn btn-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              My Dashboard
            </h1>
            <p className="text-gray-600">
              View your bookings and track their status.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-3xl font-bold mt-1">{totalBookings}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-3xl font-bold mt-1">{upcomingBookings}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-3xl font-bold mt-1">{completedBookings}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-3xl font-bold mt-1">₹{totalSpent}</p>
              <p className="text-xs text-gray-500 mt-1">
                On completed bookings: ₹{totalCompletedSpent}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-display font-bold mb-6">
              <Link className="cursor-pointer" href={'/user/bookings'}>
                My Bookings
              </Link>
            </h2>

            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  You have no bookings yet.
                </p>
                <Link href="/services" className="btn btn-primary">
                  Book a Service
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 10).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-bold">
                        {booking.serviceId?.name || 'Service'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Provider:{' '}
                        {booking.vendorId?.businessName ||
                          booking.vendorId?.name ||
                          'Vendor'}
                      </p>
                      {booking.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Date: {new Date(booking.date).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">₹{booking.price}</p>
                      <span
                        className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}