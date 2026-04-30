// app/login/LoginPageClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import Header from '@/components/shared/Header';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function LoginPageClient({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim()) {
        const msg = 'Email is required';
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      if (!password) {
        const msg = 'Password is required';
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }

      const session = await getSession();

      let target = '/user/dashboard';
      const role = (session?.user as any)?.role;

      if (role === 'admin') {
        target = '/admin/dashboard';
      } else if (role === 'vendor') {
        target = '/vendor/dashboard';
      }

      toast.success('Logged in successfully');
      router.push(target);
    } catch (err) {
      const msg = 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Sign In</h1>
            <p className="text-gray-600">
              Welcome back! Sign in to your account
            </p>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-bold text-sm mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-sm mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-primary font-bold hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}