'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  variant?: 'default' | 'transparent';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const { data: session } = useSession();

  const role = (session?.user as any)?.role;

  const dashboardHref =
    role === 'admin'
      ? '/admin/dashboard'
      : role === 'vendor'
      ? '/vendor/dashboard'
      : '/user/dashboard';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b',
        variant === 'transparent'
          ? 'bg-transparent border-transparent'
          : 'bg-white border-gray-200'
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">AC</span>
          </div>
          <span className="font-display font-bold text-xl text-gray-900">
            Architectural
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/services" className="text-gray-700 hover:text-primary transition-colors">
            Services
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href={dashboardHref}
                className="text-sm text-gray-700 font-medium hover:text-primary"
              >
                {session.user?.name || 'My Dashboard'}
              </Link>
              <button
                onClick={() => signOut()}
                className="btn btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-secondary text-sm">
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-primary text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}