// app/(admin)/admin/users/page.tsx
'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  isActive: boolean;
  createdAt?: string;
}

interface VendorWithUser {
  _id: string;
  businessName: string;
  city: string;
  isVerified: boolean;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'vendor' | 'admin';
    isActive: boolean;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [vendors, setVendors] = useState<VendorWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchData();
    } else if (status === 'authenticated') {
      setError('You must be an admin to access this page');
      setLoading(false);
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to fetch users/vendors');
      }
      const data = await res.json();
      setUsers(data.data.users || []);
      setVendors(data.data.vendors || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // role change (admin only)
  const handleChangeRole = async (userId: string, role: AdminUser['role']) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to update role');
      }

      toast.success('User role updated');
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    }
  };

  // User Active / Inactive toggle
  const handleToggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to update user active state');
      }

      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    }
  };

  // Vendor owner Active / Inactive toggle
  const handleToggleVendorUserActive = async (
    vendorUserId: string,
    isActive: boolean
  ) => {
    try {
      const res = await fetch(`/api/admin/users/${vendorUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || 'Failed to update vendor user active state'
        );
      }

      toast.success(
        `Vendor owner ${!isActive ? 'activated' : 'deactivated'}`
      );
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    }
  };

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
        <h1 className="text-4xl font-display font-bold mb-2">
          Manage Users & Vendors
        </h1>
        <p className="text-gray-600 mb-8">
          View and manage user roles, activation status, and vendor accounts.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Users table */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold">Users</h2>
            <span className="text-sm text-gray-500">{users.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleChangeRole(
                              user._id,
                              e.target.value as AdminUser['role']
                            )
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="user">User</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() =>
                            handleToggleUserActive(user._id, user.isActive)
                          }
                          className={`text-xs px-2 py-1 rounded border ${
                            user.isActive
                              ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100'
                              : 'border-green-300 text-green-600 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendors list */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold">Vendors</h2>
            <span className="text-sm text-gray-500">{vendors.length} total</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {vendors.map((vendor) => (
              <div
                key={vendor._id}
                className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-bold">
                    {vendor.businessName}{' '}
                    <span className="text-xs text-gray-500">
                      ({vendor.city})
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Owner: {vendor.userId?.name} ({vendor.userId?.email})
                  </p>
                  <p className="text-xs mt-1">
                    Status:{' '}
                    <span
                      className={`text-xs px-1 py-px rounded ml-1 ${
                        vendor.userId?.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vendor.userId.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`badge text-xs ${
                      vendor.isVerified ? 'badge-success' : 'badge-pending'
                    }`}
                  >
                    {vendor.isVerified ? 'Verified' : 'Pending'}
                  </span>
                  <button
                    onClick={() =>
                      handleToggleVendorUserActive(
                        vendor.userId._id,
                        vendor.userId.isActive
                      )
                    }
                    className={`text-xs px-2 py-1 rounded border ${
                      vendor.userId.isActive
                        ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100'
                        : 'border-green-300 text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {vendor.userId.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}

            {vendors.length === 0 && (
              <p className="text-center text-gray-500 py-6">
                No vendors found.
              </p>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}