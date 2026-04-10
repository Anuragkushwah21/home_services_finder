'use client';

import { JSX, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import {
  Wrench,
  Home,
  Store,
  MapPin,
  ArrowRight,
  Star,
  Bolt,
  Droplets,
  Sparkles,
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  icon: string;
  type: string;
}

interface FeaturedService {
  _id: string;
  name: string;
  basePrice: number;
  rating: number;
  totalReviews?: number; // <-- new
  vendorId: { businessName: string };
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  // icon map for categories
  const categoryIconMap: Record<string, JSX.Element> = {
    home: <Home className="w-8 h-8" />,
    store: <Store className="w-8 h-8" />,
    wrench: <Wrench className="w-8 h-8" />,
    electric: <Bolt className="w-8 h-8" />, // e.g. electrician
    plumbing: <Droplets className="w-8 h-8" />, // e.g. plumber
    cleaning: <Sparkles className="w-8 h-8" />, // e.g. cleaning
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, servRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/services?limit=6&sort=popular'), // optional: sort by popularity
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }

        if (servRes.ok) {
          const servData = await servRes.json();
          setFeaturedServices(servData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      window.location.href = `/services?city=${encodeURIComponent(city)}`;
    }
  };

  return (
    <div>
      <Header variant="transparent" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-blue-600 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-balance">
                Premium Services, Delivered to Your Door
              </h1>
              <p className="text-lg text-blue-100 mb-8 text-pretty">
                Book trusted professionals for home and shop services. From plumbing to electrical work, we connect you with verified experts.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <button type="submit" className="btn btn-accent">
                  Search
                </button>
              </form>

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>Transparent Pricing</span>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="hidden md:block">
              <div className="bg-blue-700 rounded-2xl aspect-square flex items-center justify-center">
                <Wrench className="w-32 h-32 text-blue-400 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl">
            Find services across various categories. Whether you need home repairs or professional services, we&apos;ve got you covered.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link key={category._id} href={`/services?categoryId=${category._id}`}>
                <div className="card hover:bg-primary hover:text-white cursor-pointer transition-all duration-300 text-center">
                  <div className="text-4xl mb-3 flex justify-center">
                    {categoryIconMap[category.icon] ?? (
                      <Wrench className="w-8 h-8" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm md:text-base">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-white">
                    {category.type === 'both'
                      ? 'Home & Shop'
                      : category.type === 'home'
                      ? 'Home'
                      : 'Shop'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Featured Services
              </h2>
              <p className="text-gray-600">
                Most popular services booked by our customers
              </p>
            </div>
            <Link href="/services" className="btn btn-primary gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Link key={service._id} href={`/services/${service._id}`}>
                <div className="card hover:shadow-elevated cursor-pointer transition-all duration-300">
                  <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                  <p className="text-primary font-medium text-sm mb-2">
                    {service.vendorId?.businessName || 'Professional Vendor'}
                  </p>

                  {/* extra info line (optional) */}
                  <p className="text-xs text-gray-500 mb-4">
                    Starting from <span className="font-semibold">₹{service.basePrice}</span>
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">
                        {service.rating?.toFixed ? service.rating.toFixed(1) : '4.5'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({service.totalReviews ?? 0} reviews)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">₹{service.basePrice}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {featuredServices.length === 0 && !loading && (
              <p className="text-gray-500 text-sm">
                No featured services available right now.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Book Your Service?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust us for professional home and shop services.
          </p>
          <Link
            href="/services"
            className="btn bg-accent text-white hover:bg-orange-600 inline-block"
          >
            Explore Services Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}