'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

interface BookingFormProps {
  serviceId: string;
  serviceType: string; // 'home' | 'shop' | 'both'
  basePrice: number;
  vendorCity: string;
}

export default function BookingForm({
  serviceId,
  serviceType,
  basePrice,
  vendorCity,
}: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [bookingType, setBookingType] = useState<'home' | 'shop'>(
    serviceType === 'home' ? 'home' : 'shop'
  );
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!session) {
      toast.error('Please sign in to book services');
      router.push('/login');
      return;
    }

    if (!bookingDate || !bookingTime) {
      const msg = 'Please fill in all required fields';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    if (bookingType === 'home' && !address) {
      const msg = 'Address is required for home services';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          bookingType,
          bookingDate,
          bookingTime,
          address:
            bookingType === 'home'
              ? { addressLine: address, city: vendorCity }
              : undefined,
          notes,
        }),
      });

      if (!response.ok) {
        let msg = 'Failed to create booking';
        try {
          const data = await response.json();
          msg = data.error || msg;
        } catch {
          // ignore JSON parse error
        }
        throw new Error(msg);
      }

      toast.success('Booking created successfully');
      router.push('/user/bookings');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canBookHome = ['home', 'both'].includes(serviceType);
  const canBookShop = ['shop', 'both'].includes(serviceType);

  if (!canBookHome && !canBookShop) {
    return (
      <div className="card">
        <p className="text-error">Service type not available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-display font-bold text-xl mb-6">Book This Service</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Booking Type Selection */}
        {canBookHome && canBookShop && (
          <div>
            <label className="block font-bold text-sm mb-3">Booking Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingType('home')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  bookingType === 'home'
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm">Home Service</div>
                <div className="text-xs text-gray-600 mt-1">
                  At your location
                </div>
              </button>
              <button
                type="button"
                onClick={() => setBookingType('shop')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  bookingType === 'shop'
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm">Shop Service</div>
                <div className="text-xs text-gray-600 mt-1">
                  At shop location
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="flex items-center gap-2 font-bold text-sm mb-2">
            <Calendar className="w-4 h-4" />
            Preferred Date *
          </label>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input-field"
            required
          />
        </div>

        {/* Time */}
        <div>
          <label className="flex items-center gap-2 font-bold text-sm mb-2">
            <Clock className="w-4 h-4" />
            Preferred Time *
          </label>
          <input
            type="time"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
            className="input-field"
            required
          />
        </div>

        {/* Address for Home Services */}
        {bookingType === 'home' && (
          <div>
            <label className="flex items-center gap-2 font-bold text-sm mb-2">
              <MapPin className="w-4 h-4" />
              Service Address *
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete address including street, building, etc."
              className="input-field resize-none h-24"
              required
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block font-bold text-sm mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific requirements or instructions?"
            className="input-field resize-none h-20"
          />
        </div>

        {/* Price Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service Price</span>
            <span className="font-bold">₹{basePrice}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-bold">Total Amount</span>
            <span className="font-bold text-lg text-accent">₹{basePrice}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>

        {!session && (
          <p className="text-center text-sm text-gray-600">
            Please sign in to book services
          </p>
        )}
      </form>
    </div>
  );
}