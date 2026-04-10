'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReviewForm from '@/components/customer/ReviewForm';
import { Calendar, Clock, MapPin, AlertCircle, X } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    basePrice: number;
    rating: number;
  };
  vendorId: {
    _id: string;
    businessName: string;
    rating: number;
  };
  bookingType: string;
  bookingDate: string;
  bookingTime: string;
  address: { addressLine: string; city: string };
  notes: string;
  status: string;
  price: number;
  createdAt: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      console.log('fetch ',res)
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!res.ok) throw new Error('Failed to cancel booking');
      fetchBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const filteredBookings =
    filterStatus === 'all'
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  if (loading) {
    return (
      <div>
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your bookings
            </p>
            <button
              onClick={() => router.push('/login')}
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
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage all your service bookings
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
          <div className="text-center py-12 card">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all'
                ? 'You haven\'t made any bookings yet.'
                : `No ${filterStatus} bookings.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {booking.serviceId?.name}
                    </h3>
                    <p className="text-primary font-medium">
                      {booking.vendorId?.businessName}
                    </p>
                  </div>

                  <span className={`badge ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Booking Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="font-medium">
                        {formatDate(new Date(booking.bookingDate))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="font-medium">{booking.bookingTime}</p>
                    </div>
                  </div>

                  {booking.bookingType === 'home' && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Service Address</p>
                        <p className="font-medium">
                          {booking.address?.addressLine}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-accent">
                      ₹{booking.price}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="btn btn-danger text-sm"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === 'completed' && (
                      <button
                        onClick={() => setReviewingBooking(booking)}
                        className="btn btn-secondary text-sm"
                      >
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Review Your Booking</h2>
              <button
                onClick={() => setReviewingBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <ReviewForm
              bookingId={reviewingBooking._id}
              serviceId={reviewingBooking.serviceId._id}
              vendorId={reviewingBooking.vendorId._id}
              userEmail={currentUser?.email}
              onSuccess={() => {
                setReviewingBooking(null);
                fetchBookings();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
