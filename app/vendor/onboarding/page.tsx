'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import { CheckCircle, Clock, FileText, ShoppingCart } from 'lucide-react';

export default function VendorOnboarding() {
  const router = useRouter();
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'vendor') {
      router.push('/');
      return;
    }

    checkVendorProfile(userData);
  }, [router]);

  const checkVendorProfile = async (userData: any) => {
    try {
      const response = await fetch('/api/vendor-profile', {
        headers: {
          'x-user-email': userData.email,
        },
      });

      const data = await response.json();
      setVendorProfile(data.vendor);
      setLoading(false);
    } catch (error) {
      console.error('Error checking vendor profile:', error);
      setLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Complete Your Profile',
      description: 'Add your business details, experience, and service area',
      icon: FileText,
      completed: vendorProfile?.profileCompleted || false,
      link: '/vendor/profile',
      buttonText: 'Complete Profile',
    },
    {
      number: 2,
      title: 'Add Your Services',
      description: 'Create service listings with prices and descriptions',
      icon: ShoppingCart,
      completed: false,
      link: '/vendor/services',
      buttonText: 'Add Services',
      disabled: !vendorProfile?.profileCompleted,
    },
    {
      number: 3,
      title: 'Manage Bookings',
      description: 'Accept bookings and communicate with customers',
      icon: Clock,
      completed: false,
      link: '/vendor/bookings',
      buttonText: 'Go to Bookings',
      disabled: !vendorProfile?.profileCompleted,
    },
  ];

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-display font-bold mb-4">
              Welcome to Your Vendor Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Let&apos;s get you set up to start receiving bookings
            </p>
          </div>

          <div className="grid gap-6">
            {steps.map((step) => {
              return (
                <div
                  key={step.number}
                  className={`card p-6 border-l-4 ${
                    step.completed
                      ? 'border-l-green-500 bg-green-50'
                      : 'border-l-primary'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        step.completed ? 'bg-green-500' : 'bg-primary'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        step.number
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">{step.title}</h2>
                        {step.completed && (
                          <span className="inline-block px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{step.description}</p>

                      <Link
                        href={step.link}
                        className={`inline-block px-6 py-2 rounded-lg font-bold transition-colors ${
                          step.disabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-dark'
                        }`}
                        onClick={(e) => {
                          if (step.disabled) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {step.buttonText}
                        {step.disabled && ' (Complete previous steps first)'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {vendorProfile?.profileCompleted && (
            <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-4 items-start">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-900 mb-2">
                    Ready to Go Live!
                  </h3>
                  <p className="text-green-800 mb-4">
                    Your profile is complete. Now add some services and start
                    accepting bookings.
                  </p>
                  <Link
                    href="/vendor/services"
                    className="text-green-700 font-bold underline"
                  >
                    Add Your First Service →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}