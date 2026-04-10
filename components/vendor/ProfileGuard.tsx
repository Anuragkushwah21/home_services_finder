'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface ProfileGuardProps {
  children: React.ReactNode;
  requireProfileComplete?: boolean;
}

export default function ProfileGuard({ 
  children, 
  requireProfileComplete = true 
}: ProfileGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(user);
        
        // Fetch vendor profile to check if completed
        const response = await fetch('/api/vendor-profile', {
          headers: {
            'x-user-email': userData.email,
          },
        });

        const data = await response.json();

        if (data.vendor && data.vendor.profileCompleted) {
          setProfileCompleted(true);
          setIsLoading(false);
        } else if (requireProfileComplete) {
          router.push('/vendor/profile');
        } else {
          setProfileCompleted(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [router, requireProfileComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (requireProfileComplete && !profileCompleted) {
    return null;
  }

  return <>{children}</>;
}
