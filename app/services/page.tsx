'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/shared/Header';
import ServiceCard from '@/components/shared/ServiceCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Filter, MapPin, X } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  rating: number;
  serviceType: string;
  vendorId: { businessName: string; rating: number };
  categoryId: { name: string; icon: string };
}

interface Category {
  _id: string;
  name: string;
  type: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [serviceType, setServiceType] = useState<'all' | 'home' | 'shop' | 'both'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch services with current filters
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (categoryId) params.append('categoryId', categoryId);
      if (serviceType && serviceType !== 'all') params.append('serviceType', serviceType);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await fetch(`/api/services?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, [city, categoryId, serviceType, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const resetFilters = () => {
    setCity('');
    setCategoryId('');
    setServiceType('all');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  const activeFilters =
    city || categoryId || serviceType !== 'all' || minPrice || maxPrice;

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* FILTER NAV BAR */}
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          {/* Top row: location + main controls */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 border-b border-gray-100">
            {/* Location search */}
            <div className="flex-1 flex items-center gap-2">
              <div className="relative w-full">
                <MapPin className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search services by location (city, area...)"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Quick info + reset + expand filters */}
            <div className="flex items-center justify-between md:justify-end gap-3">
              <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                {services.length} services found
              </span>

              {activeFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-xs md:text-sm text-gray-500 hover:text-gray-800"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}

              <button
                onClick={() => setShowMoreFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs md:text-sm text-gray-700 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Bottom row: expanded filters */}
          {showMoreFilters && (
            <div className="px-4 py-3 grid md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block font-bold text-xs mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Type */}
              <div>
                <label className="block font-bold text-xs mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => {
                    setServiceType(e.target.value as any);
                    setPage(1);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Types</option>
                  <option value="home">Home Service</option>
                  <option value="shop">Shop Service</option>
                  <option value="both">Both</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block font-bold text-xs mb-1">
                  Price Range (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SERVICES LIST */}
        {loading ? (
          <LoadingSpinner />
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600 mb-6">
              Try changing the location or filters
            </p>
            <button onClick={resetFilters} className="btn btn-primary">
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  href={`/services/${service._id}`}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={services.length < 20}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}