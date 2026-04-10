'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId: { name: string; email: string };
  createdAt: string;
}

interface ReviewsListProps {
  vendorId?: string;
  serviceId?: string;
}

export default function ReviewsList({ vendorId, serviceId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (vendorId) params.append('vendorId', vendorId);
      if (serviceId) params.append('serviceId', serviceId);

      const res = await fetch(`/api/reviews?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');

      const data = await res.json();
      const list: Review[] = data.data || [];
      setReviews(list);

      if (list.length > 0) {
        const avg =
          list.reduce((sum, r) => sum + r.rating, 0) / list.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [vendorId, serviceId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-3xl font-bold">{averageRating}</p>
            <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Based on {reviews.length} reviews
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-sm">{review.userId.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(new Date(review.createdAt))}
                </p>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-gray-700">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}