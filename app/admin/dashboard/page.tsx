'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  AlertCircle,
  Users,
  Building2,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  users: number;
  vendors: { total: number; verified: number; pending: number };
  bookings: { total: number; completed: number };
  services: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchStats();
    } else if (status === 'authenticated') {
      setError('You must be an admin to access this page');
      setLoading(false);
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      // console.log('status',res)
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data.data);
    } catch (err) {
      console.error('[v0] Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
            <p className="text-gray-600">
              You must be an admin to access this page
            </p>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-display font-bold">
                    {stats.users}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
                  <p className="text-3xl font-display font-bold">
                    {stats.vendors.total}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.vendors.verified} verified
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 text-purple-700">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-display font-bold">
                    {stats.bookings.total}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.bookings.completed} completed
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-700">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Services</p>
                  <p className="text-3xl font-display font-bold">
                    {stats.services}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100 text-orange-700">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-display font-bold">
                    ₹{(stats.revenue ).toFixed(0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-700">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link href="/admin/vendors">
            <div className="card hover:shadow-elevated cursor-pointer transition-all">
              <h3 className="font-display font-bold text-xl mb-2">
                Vendor Approvals
              </h3>
              {stats && (
                <p className="text-gray-600 mb-4">
                  {stats.vendors.pending} pending approval
                </p>
              )}
              <div className="text-primary font-bold">Manage Vendors →</div>
            </div>
          </Link>

          <Link href="/admin/categories">
            <div className="card hover:shadow-elevated cursor-pointer transition-all">
              <h3 className="font-display font-bold text-xl mb-2">
                Manage Categories
              </h3>
              <p className="text-gray-600 mb-4">
                Create and manage service categories
              </p>
              <div className="text-primary font-bold">Go to Categories →</div>
            </div>
          </Link>

          <Link href="/admin/bookings">
            <div className="card hover:shadow-elevated cursor-pointer transition-all">
              <h3 className="font-display font-bold text-xl mb-2">
                Booking Oversight
              </h3>
              <p className="text-gray-600 mb-4">
                Monitor all platform bookings
              </p>
              <div className="text-primary font-bold">View All Bookings →</div>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="card hover:shadow-elevated cursor-pointer transition-all">
              <h3 className="font-display font-bold text-xl mb-2">
                Manage Users & Vendors
              </h3>
              <p className="text-gray-600 mb-4">
                View users, change roles and inspect vendor accounts
              </p>
              <div className="text-primary font-bold">Open Users Panel →</div>
            </div>
          </Link>

          {/* You can put Revenue card here, or move one of the above to keep 4 per row */}
        </div>

        {/* Second row for revenue if you like */}
        <div className="grid md:grid-cols-4 gap-6 mt-6">
          <Link href="/admin/revenue">
            <div className="card hover:shadow-elevated cursor-pointer transition-all">
              <h3 className="font-display font-bold text-xl mb-2">
                Revenue Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                Analyse revenue trends and performance with graphs
              </p>
              <div className="text-primary font-bold">View Revenue Graph →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}