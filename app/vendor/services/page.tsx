'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Service {
  _id: string;
  name: string;
  basePrice: number;
  durationMinutes: number;
  serviceType: string;
  rating: number;
  totalBookings: number;
  isActive: boolean;
  categoryId: { name: string };
}

export default function VendorServicesPage() {
  const { data: session, status } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (
      status === 'authenticated' &&
      (session?.user as any)?.role === 'vendor'
    ) {
      fetchServices();
    } else if (status === 'authenticated') {
      setError('You must be a vendor to access this page');
      setLoading(false);
    }
  }, [status, session]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/vendors/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      setServices(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const res = await fetch(`/api/vendors/services/${serviceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete service');
      fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">My Services</h1>
            <p className="text-gray-600">
              {services.length} service{services.length !== 1 ? 's' : ''} listed
            </p>
          </div>
          <Link href="/vendor/services/new" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Service
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {services.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No services yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first service to start accepting bookings
            </p>
            <Link href="/vendor/services/new" className="btn btn-primary">
              Add Your First Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service._id}
                className="card flex items-start justify-between hover:shadow-elevated transition-all"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {service.categoryId?.name}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                      {service.serviceType === 'both'
                        ? 'Home & Shop'
                        : service.serviceType}
                    </span>
                    <span className="text-gray-600">
                      ₹{service.basePrice} • {service.durationMinutes} min
                    </span>
                    {service.totalBookings > 0 && (
                      <span className="text-gray-600">
                        ⭐ {service.rating.toFixed(1)} ({service.totalBookings} bookings)
                      </span>
                    )}
                  </div>
                  {!service.isActive && (
                    <span className="badge badge-error text-xs mt-2">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/vendor/services/${service._id}/edit`}
                    className="btn btn-secondary p-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="btn btn-danger p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
