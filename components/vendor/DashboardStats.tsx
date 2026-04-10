'use client';

import { TrendingUp, Calendar, DollarSign, Star } from 'lucide-react';

interface DashboardStatsProps {
  totalBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  averageRating: number;
}

export default function DashboardStats({
  totalBookings,
  pendingBookings,
  totalEarnings,
  averageRating,
}: DashboardStatsProps) {
  const stats = [
    {
      icon: Calendar,
      label: 'Total Bookings',
      value: totalBookings.toString(),
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: TrendingUp,
      label: 'Pending Bookings',
      value: pendingBookings.toString(),
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString()}`,
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: averageRating.toFixed(1),
      color: 'bg-accent text-orange-700',
    },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-display font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
