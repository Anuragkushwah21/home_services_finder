'use client';

import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import ServiceForm from '@/components/vendor/ServiceForm';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewServicePage() {
  const { data: session, status } = useSession();

  if (status === 'unauthenticated') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">
              Sign In Required
            </h1>
            <button onClick={() => signIn()} className="btn btn-primary">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && (session?.user as any)?.role !== 'vendor') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">
              Vendor Access Required
            </h1>
            <Link href="/vendor/signup" className="btn btn-primary">
              Become a Vendor
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
            <Link href="/vendor/services" className="text-primary hover:text-blue-700 mb-4 inline-block">
              ← Back to Services
            </Link>
            <h1 className="text-4xl font-display font-bold mb-2">
              Add New Service
            </h1>
            <p className="text-gray-600">
              Create a new service offering to attract customers
            </p>
          </div>

          <div className="card">
            <ServiceForm />
          </div>
        </div>
      </div>
    </div>
  );
}
