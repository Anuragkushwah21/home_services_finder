'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import DashboardStats from '@/components/vendor/DashboardStats';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Booking {
  _id?: string;
  status: string;
  price: number;
  serviceId?: { name?: string };
  userId?: { name?: string };
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  userId?: {
    name?: string;
    email?: string;
  };
  serviceId?: {
    name?: string;
  };
}

export default function VendorDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [vendorVerified, setVendorVerified] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    const user = session?.user as any;

    if (!user || user.role !== 'vendor') {
      setError('You must be a vendor to access this page');
      toast.error('You must be a vendor to access this page');
      setLoading(false);
      setReviewsLoading(false);
      return;
    }

    checkProfileAndFetchData(user);
  }, [status, session]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/vendors/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      toast.error(msg);
    }
  };

  const fetchVendorReviews = async (vendorId: string) => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`/api/reviews?vendorId=${vendorId}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      const msg = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(msg);
      toast.error(msg);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchVendorStatus = async () => {
    try {
      const vendorRes = await fetch('/api/vendors/me');
      if (!vendorRes.ok) return;
      const vendorData = await vendorRes.json();

      if (vendorData.vendor?.isVerified) {
        setVendorVerified(true);
      } else {
        setVendorVerified(false);
      }
    } catch (err) {
      console.error('Error fetching vendor status:', err);
      toast.error('Error fetching vendor status');
    } finally {
      setLoading(false);
    }
  };

  const checkProfileAndFetchData = async (userData: any) => {
    try {
      const profileRes = await fetch('/api/vendor-profile', {
        headers: {
          'x-user-email': userData.email,
        },
      });

      if (!profileRes.ok) {
        throw new Error('Failed to load vendor profile');
      }

      const profileData = await profileRes.json();

      if (!profileData.vendor || !profileData.vendor.profileCompleted) {
        toast.info('Please complete your vendor profile first');
        router.push('/vendor/profile');
        return;
      }

      setProfileCompleted(true);

      const vendorId = userData._id || userData.id; // ensure this exists from session callback

      await Promise.all([
        fetchBookings(),
        fetchVendorStatus(),
        fetchVendorReviews(vendorId),
      ]);
    } catch (err) {
      console.error('Error checking profile:', err);
      const msg = err instanceof Error ? err.message : 'Failed to verify profile';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      setReviewsLoading(false);
    }
  };

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const totalEarnings = bookings
    .filter((b) => ['completed', 'in_progress', 'accepted'].includes(b.status))
    .reduce((sum, b) => sum + b.price, 0);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

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
            <p className="text-gray-600 mb-6">
              You need to be a vendor to access this dashboard
            </p>
            <Link href="/vendor/signup" className="btn btn-primary">
              Become a Vendor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profileCompleted) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 font-medium">
              Complete your vendor profile to access the dashboard.
            </p>
          </div>
          <Link href="/vendor/profile" className="btn btn-primary">
            Complete Profile
          </Link>
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
            Vendor Dashboard
          </h1>
          <p className="text-gray-600">Manage your services and bookings</p>
        </div>

        {!vendorVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800 font-medium">
              ⚠️ Your vendor profile is pending approval. Services will be visible
              once approved.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <DashboardStats
          totalBookings={totalBookings}
          pendingBookings={pendingBookings}
          totalEarnings={totalEarnings}
          averageRating={averageRating}
        />

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/vendor/services">
            <div className="card hover:shadow-elevated cursor-pointer transition-all">
              <h3 className="font-display font-bold text-xl mb-2">
                My Services
              </h3>
              <p className="text-gray-600 mb-4">
                View and manage your services
              </p>
              <div className="text-primary font-bold">View Services →</div>
            </div>
          </Link>

          <Link href="/vendor/bookings">
            <div className="card hover:shadow-elevated cursor-pointer transition-all">
              <h3 className="font-display font-bold text-xl mb-2">
                My Bookings
              </h3>
              <p className="text-gray-600 mb-4">Manage customer bookings</p>
              <div className="text-primary font-bold">View Bookings →</div>
            </div>
          </Link>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-display font-bold mb-6">
            Customer Reviews
          </h2>

          {reviewsLoading ? (
            <p className="text-gray-600">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {review.userId?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-accent font-bold">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      {review.rating}/5
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-6">
            Recent Bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking: any, index) => (
                <div
                  key={booking._id || index}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-bold">{booking.serviceId?.name}</p>
                    <p className="text-sm text-gray-600">
                      Customer: {booking.userId?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">₹{booking.price}</p>
                    <p
                      className={`text-sm font-medium badge badge-${booking.status}`}
                    >
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}