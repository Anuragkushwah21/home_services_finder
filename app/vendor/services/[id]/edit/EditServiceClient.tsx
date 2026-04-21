// app/vendor/services/[id]/edit/EditServiceClient.tsx
'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import ServiceForm from '@/components/vendor/ServiceForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EditServiceClientProps {
  id: string;
}

export default function EditServiceClient({ id }: EditServiceClientProps) {
  const { data: session, status } = useSession();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'vendor') {
      fetchService();
    } else if (status === 'authenticated') {
      setError('You must be a vendor to access this page');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/services/${id}`);
      if (!res.ok) throw new Error('Service not found');
      const data = await res.json();
      setService(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service');
    } finally {
      setLoading(false);
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

  if (error || !service) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error || 'Service not found'}</p>
            <Link href="/vendor/services" className="btn btn-primary">
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/vendor/services"
              className="text-primary hover:text-blue-700 mb-4 inline-block"
            >
              ← Back to Services
            </Link>
            <h1 className="text-4xl font-display font-bold mb-2">
              Edit Service
            </h1>
            <p className="text-gray-600">
              Update service details and pricing
            </p>
          </div>

          <div className="card">
            <ServiceForm initialData={service} isEditing={true} />
          </div>
        </div>
      </div>
    </div>
  );
}