// app/services/[id]/ServiceDetailClient.tsx
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import BookingForm from '@/components/customer/BookingForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Star, MapPin, Clock, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  priceUnit: string;
  durationMinutes: number;
  serviceType: 'home' | 'shop' | 'both' | string;
  tags: string[];
  rating: number;
  totalBookings: number;
  vendorId: {
    _id: string;
    businessName: string;
    description: string;
    city: string;
    rating: number;
    workingHours: string;
    shopAddress: string;
    experienceYears: number;
    totalBookings: number;
  };
  categoryId: {
    name: string;
    icon: string;
  };
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
}

export interface ServiceDetailClientProps {
  id: string;
}

export default function ServiceDetailClient({ id }: ServiceDetailClientProps) {
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');

  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isCustomer = user?.role === 'user';

  // fetch service details by id
  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) {
          throw new Error('Service not found');
        }
        const data = await res.json();
        setService(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load service'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // fetch reviews for the service
  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await fetch(`/api/reviews?serviceId=${id}`);
        if (!res.ok) {
          throw new Error('Failed to load reviews');
        }
        const data = await res.json();
        setReviews(data.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/services"
            className="inline-flex items-center text-sm text-gray-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to services
          </Link>
          <p className="text-red-600 font-medium">
            {error || 'Service not found'}
          </p>
        </div>
      </div>
    );
  }

  const vendorCity = service.vendorId?.city || '';

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/services"
          className="flex items-center gap-2 text-primary hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="mb-2">
                    <span className="badge badge-info text-xs">
                      {service.serviceType === 'both'
                        ? 'Home & Shop'
                        : service.serviceType === 'home'
                        ? 'Home Service'
                        : 'Shop Service'}
                    </span>
                  </div>
                  <h1 className="text-4xl font-display font-bold mb-2">
                    {service.name}
                  </h1>
                  <p className="text-primary font-medium text-lg">
                    {service.categoryId?.name}
                  </p>
                </div>
              </div>

              {/* service reviews and rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="text-2xl font-bold">
                    {service.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">
                    ({service.totalBookings} bookings)
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-5xl font-display font-bold text-accent mb-1">
                  ₹{service.basePrice}
                </div>
                <p className="text-gray-600">
                  {service.priceUnit} • {service.durationMinutes} minutes
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                About This Service
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {service.description}
              </p>

              {service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge bg-blue-50 text-primary text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* service Provider */}
            <div className="card mb-8">
              <h2 className="text-2xl font-display font-bold mb-6">
                Service Provider
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {service.vendorId?.businessName}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="font-bold">
                        {service.vendorId?.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {service.vendorId?.totalBookings} total bookings
                    </span>
                  </div>
                </div>

                {service.vendorId?.description && (
                  <div>
                    <h4 className="font-bold text-sm mb-2">About</h4>
                    <p className="text-gray-700 text-sm">
                      {service.vendorId.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-gray-600">Experience</p>
                      <p className="font-bold">
                        {service.vendorId?.experienceYears} Years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-gray-600">Location</p>
                      <p className="font-bold">{service.vendorId?.city}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-gray-600">Working Hours</p>
                      <p className="text-sm font-medium">
                        {service.vendorId?.workingHours}
                      </p>
                    </div>
                  </div>
                  {service.vendorId?.shopAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Shop Address</p>
                        <p className="text-sm">
                          {service.vendorId.shopAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card mb-8">
              <h2 className="text-2xl font-display font-bold mb-4">
                Reviews
              </h2>

              {reviewsLoading ? (
                <p className="text-gray-600">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-600">
                  No reviews yet for this service.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">
                            {review.userId?.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.createdAt
                              ? new Date(
                                  review.createdAt
                                ).toLocaleDateString()
                              : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-accent font-bold">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          {review.rating}/5
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking form column */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              {status === 'loading' ? null : isCustomer ? (
                <BookingForm
                  serviceId={service._id}
                  serviceType={service.serviceType}
                  basePrice={service.basePrice}
                  vendorCity={vendorCity}
                />
              ) : (
                <div className="p-4 border rounded-lg text-sm text-gray-700">
                  You must be logged in as a customer/user to book this service.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}