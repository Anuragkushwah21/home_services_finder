// app/about/page.tsx
'use client';

import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function AboutPage() {
  return (
    <div>
      <Header />

      <main className="container mx-auto px-4 py-12">
        <section className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-display font-bold mb-4">
            About Architectural Concierge
          </h1>
          <p className="text-gray-600 mb-8">
            Architectural Concierge is a premium services marketplace that connects
            homeowners, architects, designers, and service providers to bring
            high–quality spaces to life.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We aim to make finding trusted architectural and interior services
                as easy as booking a cab. From discovery to delivery, we focus on
                transparency, reliability, and a great client experience.
              </p>
              <h2 className="text-2xl font-semibold mb-3">Who We Serve</h2>
              <ul className="space-y-2 text-gray-600 list-disc list-inside">
                <li>Homeowners looking for verified professionals</li>
                <li>Vendors and service providers growing their business</li>
                <li>Architects and designers managing multiple projects</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">What You Can Do</h2>
              <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                <li>Browse and book curated services</li>
                <li>Manage projects and communication in one place</li>
                <li>Track progress and stay on top of timelines</li>
              </ul>
              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="inline-block w-full text-center btn btn-primary"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-block w-full text-center text-primary font-semibold"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}