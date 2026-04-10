'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

interface Booking {
  _id: string;
  userId: { name: string };
  serviceId: { name: string };
  vendorId: { businessName: string };
  bookingDate: string;
  status: string;
  price: number;
}

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchBookings();
    } else if (status === 'authenticated') {
      setError('You must be an admin');
      setLoading(false);
    }
  }, [status, session]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings/admin');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.data || []);
      }
    } catch (err) {
      console.error('[v0] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings =
    filterStatus === 'all'
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  if (status === 'loading' || loading) {
    return (
      <div>
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (!session || (session?.user as any)?.role !== 'admin') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">
              Admin Access Required
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold mb-2">
          All Platform Bookings
        </h1>
        <p className="text-gray-600 mb-8">
          Monitor all bookings across the platform
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filterStatus === status
                    ? 'btn btn-primary'
                    : 'btn btn-secondary'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            )
          )}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-xl font-bold">No bookings found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-bold">Customer</th>
                  <th className="text-left p-4 font-bold">Service</th>
                  <th className="text-left p-4 font-bold">Vendor</th>
                  <th className="text-left p-4 font-bold">Date</th>
                  <th className="text-left p-4 font-bold">Amount</th>
                  <th className="text-left p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4">{booking.userId?.name}</td>
                    <td className="p-4">{booking.serviceId?.name}</td>
                    <td className="p-4">{booking.vendorId?.businessName}</td>
                    <td className="p-4">
                      {formatDate(new Date(booking.bookingDate))}
                    </td>
                    <td className="p-4 font-bold">₹{booking.price}</td>
                    <td className="p-4">
                      <span className={`badge ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
