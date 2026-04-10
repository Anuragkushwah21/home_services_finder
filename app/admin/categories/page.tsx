'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle, Pencil, Trash2, Check, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Category {
  _id: string;
  name: string;
  type: 'home' | 'shop' | 'both';
  isActive: boolean;
}

type StatusFilter = 'all' | 'active' | 'inactive';

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'both' as const,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Category>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchCategories();
    } else if (status === 'authenticated') {
      setError('You must be an admin to access this page');
      setLoading(false);
    }
  }, [status, session]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error('[v0] Error:', err);
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to add category');
      }

      setNewCategory({ name: '', type: 'both' });
      await fetchCategories();
      toast.success('Category added successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditValues({
      name: cat.name,
      type: cat.type,
      isActive: cat.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleUpdateCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to update category');
      }

      await fetchCategories();
      cancelEdit();
      toast.success('Category updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to delete category');
      }

      await fetchCategories();
      toast.error('Category deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (statusFilter === 'active') return cat.isActive;
    if (statusFilter === 'inactive') return !cat.isActive;
    return true;
  });

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
          Manage Categories
        </h1>
        <p className="text-gray-600 mb-8">
          Create and manage service categories
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Add Category Form */}
          <div className="card">
            <h2 className="text-2xl font-display font-bold mb-6">
              Add New Category
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block font-bold text-sm mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Plumbing"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-sm mb-2">
                  Service Type
                </label>
                <select
                  value={newCategory.type}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                    }))
                  }
                  className="input-field"
                >
                  <option value="home">Home Service</option>
                  <option value="shop">Shop Service</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <button type="submit" className="w-full btn btn-primary">
                Add Category
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold">
                Existing Categories ({filteredCategories.length})
              </h2>
              <div className="flex gap-2">
                {(['all', 'active', 'inactive'] as StatusFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      statusFilter === f
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {f[0].toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCategories.map((cat) => {
                const isEditing = editingId === cat._id;
                return (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editValues.name ?? cat.name}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="input-field mb-2"
                          />
                          <div className="flex gap-2 mb-2">
                            <select
                              value={editValues.type ?? cat.type}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  type: e.target.value as Category['type'],
                                }))
                              }
                              className="input-field"
                            >
                              <option value="home">Home Service</option>
                              <option value="shop">Shop Service</option>
                              <option value="both">Both</option>
                            </select>
                            <select
                              value={
                                (editValues.isActive ?? cat.isActive)
                                  ? 'active'
                                  : 'inactive'
                              }
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  isActive: e.target.value === 'active',
                                }))
                              }
                              className="input-field"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="font-bold">{cat.name}</p>
                          <p className="text-xs text-gray-600">
                            {cat.type === 'both' ? 'Home & Shop' : cat.type}
                          </p>
                          <span
                            className={`badge text-xs mt-1 inline-block ${
                              cat.isActive ? 'badge-success' : 'badge-error'
                            }`}
                          >
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(cat._id)}
                            className="btn btn-primary btn-icon"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="btn btn-secondary btn-icon"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="btn btn-secondary btn-icon"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="btn btn-danger btn-icon"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}