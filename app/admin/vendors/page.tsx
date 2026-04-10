'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Vendor {
  _id: string;
  businessName: string;
  description: string;
  city: string;
  experienceYears: number;
  isVerified: boolean;
  userId: { name: string; email: string; phone: string };
}

export default function VendorApprovalsPage() {
  const { data: session, status } = useSession();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'pending' | 'verified'>(
    'pending'
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchVendors();
    } else if (status === 'authenticated') {
      setError('You must be an admin to access this page');
      setLoading(false);
    }
  }, [status, session]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/vendors');
      console.log('fetching vendors',res)
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to fetch vendors');
      }

      const data = await res.json();
      setVendors(data.data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to approve vendor');
      }

      toast.success('Vendor approved successfully');
      await fetchVendors();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    }
  };

  const handleReject = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to reject vendor');
      }

      toast.info('Vendor rejected');
      await fetchVendors();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    }
  };

  const filteredVendors =
    filterVerified === 'all'
      ? vendors
      : filterVerified === 'verified'
      ? vendors.filter((v) => v.isVerified)
      : vendors.filter((v) => !v.isVerified);

  if (status === 'loading' || loading) {
    return (
      <div>
        <Header />
        <LoadingSpinner />
        <ToastContainer position="top-right" autoClose={3000} />
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
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Vendor Approvals</h1>
          <p className="text-gray-600">Review and approve vendor applications</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-8">
          {['all', 'pending', 'verified'].map((filter) => (
            <button
              key={filter}
              onClick={() =>
                setFilterVerified(filter as 'all' | 'pending' | 'verified')
              }
              className={`px-4 py-2 rounded-lg ${
                filterVerified === filter ? 'btn btn-primary' : 'btn btn-secondary'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {filteredVendors.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No vendors found
            </h3>
            <p className="text-gray-600">
              {filterVerified === 'pending'
                ? 'All pending vendors have been approved!'
                : 'No vendors to display'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <div key={vendor._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{vendor.businessName}</h3>
                      {vendor.isVerified ? (
                        <span className="badge badge-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="badge badge-pending">Pending</span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {vendor.description}
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Owner</p>
                        <p className="font-medium">{vendor.userId?.name}</p>
                        <p className="text-gray-600 text-xs">
                          {vendor.userId?.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">City</p>
                        <p className="font-medium">{vendor.city}</p>
                      </div>

                      <div>
                        <p className="text-gray-600">Experience</p>
                        <p className="font-medium">
                          {vendor.experienceYears} years
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!vendor.isVerified && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(vendor._id)}
                      className="btn btn-primary text-sm flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(vendor._id)}
                      className="btn btn-danger text-sm flex-1 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}