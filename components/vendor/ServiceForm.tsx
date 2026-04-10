'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
}

interface ServiceFormProps {
  initialData?: {
    _id?: string;
    categoryId?: { _id: string } | string;
    name?: string;
    description?: string;
    serviceType?: 'home' | 'shop' | 'both';
    basePrice?: number;
    priceUnit?: string;
    durationMinutes?: number;
    tags?: string[];
  };
  isEditing?: boolean;
}

interface ServiceFormState {
  categoryId: string;
  name: string;
  description: string;
  serviceType: 'home' | 'shop' | 'both';
  basePrice: string;          // keep as string in form
  priceUnit: string;
  durationMinutes: string;    // keep as string in form
  tags: string;
}

export default function ServiceForm({
  initialData,
  isEditing = false,
}: ServiceFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ServiceFormState>({
    categoryId:
      typeof initialData?.categoryId === 'string'
        ? initialData.categoryId
        : initialData?.categoryId?._id || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    serviceType: initialData?.serviceType || 'both',
    basePrice: initialData?.basePrice != null ? String(initialData.basePrice) : '',
    priceUnit: initialData?.priceUnit || 'per service',
    durationMinutes:
      initialData?.durationMinutes != null
        ? String(initialData.durationMinutes)
        : '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || []);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (err) {
        console.error('[v0] Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const basePrice = parseFloat(formData.basePrice);
      const durationMinutes = parseInt(formData.durationMinutes, 10);

      if (isNaN(basePrice) || isNaN(durationMinutes)) {
        throw new Error('Please enter valid numbers for price and duration');
      }

      const payload = {
        ...formData,
        basePrice,
        durationMinutes,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
      };

      const url = isEditing && initialData?._id
        ? `/api/vendors/services/${initialData._id}`
        : '/api/vendors/services';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save service');
      }

      router.push('/vendor/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Category */}
      <div>
        <label className="block font-bold text-sm mb-2">
          Category *
        </label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Service Name */}
      <div>
        <label className="block font-bold text-sm mb-2">
          Service Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Plumbing Repair"
          className="input-field"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-bold text-sm mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your service in detail"
          className="input-field resize-none h-24"
          required
        />
      </div>

      {/* Service Type */}
      <div>
        <label className="block font-bold text-sm mb-2">
          Service Type *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['home', 'shop', 'both'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  serviceType: type,
                }))
              }
              className={`p-3 rounded-lg border-2 font-medium text-sm transition-colors ${
                formData.serviceType === type
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {type === 'both' ? 'Both' : type === 'home' ? 'Home' : 'Shop'}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-sm mb-2">
            Base Price (₹) *
          </label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            placeholder="500"
            min="0"
            step="10"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-sm mb-2">
            Price Unit
          </label>
          <input
            type="text"
            name="priceUnit"
            value={formData.priceUnit}
            onChange={handleChange}
            placeholder="e.g., per service, per hour"
            className="input-field"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block font-bold text-sm mb-2">
          Duration (minutes) *
        </label>
        <input
          type="number"
          name="durationMinutes"
          value={formData.durationMinutes}
          onChange={handleChange}
          placeholder="30"
          min="15"
          step="15"
          className="input-field"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block font-bold text-sm mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., emergency, certified, warranty"
          className="input-field"
        />
        <p className="text-xs text-gray-600 mt-1">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn btn-primary disabled:opacity-50"
      >
        {loading
          ? 'Saving...'
          : isEditing
          ? 'Update Service'
          : 'Add Service'}
      </button>
    </form>
  );
}