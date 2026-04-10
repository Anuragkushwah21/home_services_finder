'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle, Calendar, Clock, User, Phone } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

interface Booking {
  _id: string;
  userId: { name: string; phone: string };
  serviceId: { name: string; basePrice: number };
  bookingDate: string;
  bookingTime: string;
  bookingType: string;
  address: { addressLine: string; city: string };
  status: string;
  price: number;
}

export default function VendorBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (
      status === 'authenticated' &&
      (session?.user as any)?.role === 'vendor'
    ) {
      fetchBookings();
    } else if (status === 'authenticated') {
      setError('You must be a vendor to access this page');
      setLoading(false);
    }
  }, [status, session]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/vendors/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/vendors/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update booking');
      fetchBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
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

  if (!session || (session?.user as any)?.role !== 'vendor') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">
              Vendor Access Required
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
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">
            Manage customer bookings and requests
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600">
              {filterStatus === 'all'
                ? 'You don\'t have any bookings yet.'
                : `No ${filterStatus} bookings.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">
                      {booking.serviceId?.name}
                    </h3>
                    <span className={`badge ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-accent text-lg">
                      ₹{booking.price}
                    </p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-600">Customer</p>
                      <p className="font-medium">{booking.userId?.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {booking.userId?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-600">Date & Time</p>
                      <p className="font-medium">
                        {formatDate(new Date(booking.bookingDate))}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {booking.bookingTime}
                      </p>
                    </div>
                  </div>

                  {booking.bookingType === 'home' && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Service Address</p>
                      <p className="font-medium text-sm">
                        {booking.address?.addressLine}, {booking.address?.city}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                        className="btn btn-primary text-sm flex-1"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        className="btn btn-danger text-sm flex-1"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                      className="btn btn-primary text-sm flex-1"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {booking.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'completed')}
                      className="btn btn-primary text-sm flex-1"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
