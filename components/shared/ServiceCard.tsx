'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Star, MapPin, Phone, Award, MessageCircle } from 'lucide-react';

interface ServiceCardProps {
  service: any;
  href: string;
}

export default function ServiceCard({ service, href }: ServiceCardProps) {
  const vendor = service.vendorId || {
    businessName: 'Service Provider',
    phone: '',
    city: '',
    experienceYears: undefined,
  };

  const averageRating =
    service.averageRating ??
    (service.rating?.toFixed ? service.rating : Number(service.rating || 0));

  const totalReviews = service.totalReviews || 0;

  return (
    <Link href={href}>
      <div className="card hover:shadow-elevated cursor-pointer transition-all duration-300">
        {/* Service Type Badge */}
        <div className="flex items-start justify-between mb-3">
          <span className="badge badge-info text-xs">
            {service.serviceType === 'both'
              ? 'Home & Shop'
              : service.serviceType === 'home'
              ? 'Home Service'
              : 'Shop Service'}
          </span>
        </div>

        {/* Service Name */}
        <h3 className="font-display font-bold text-lg mb-1 text-gray-900 line-clamp-1">
          {service.name}
        </h3>

        {/* Provider name + city */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-primary font-semibold line-clamp-1">
            {vendor.businessName || 'Service Provider'}
          </p>
          {vendor.city && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{vendor.city}</span>
            </div>
          )}
        </div>

        {/* Phone + experience */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-primary" />
            <span>{vendor.phone || 'Contact on booking'}</span>
          </div>
          {typeof vendor.experienceYears === 'number' && (
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3 text-primary" />
              <span>{vendor.experienceYears} yrs experience</span>
            </div>
          )}
        </div>

        {/* Short description */}
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {service.description}
        </p>

        {/* Rating, Reviews & Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-medium text-gray-900">
                {Number(averageRating || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MessageCircle className="w-3 h-3" />
              <span>
                {totalReviews} review{totalReviews === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-accent font-bold text-lg">
              {formatPrice(service.basePrice)}
            </p>
            <p className="text-xs text-gray-500">{service.priceUnit}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}