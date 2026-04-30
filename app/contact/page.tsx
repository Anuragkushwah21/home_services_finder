// app/contact/page.tsx
'use client';

import ContactForm from '@/components/shared/ContactForm';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export default function ContactPage() {
  return (
    <div>
      <Header />

      <main className="container mx-auto px-4 py-12">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-display font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 mb-8 max-w-2xl">
            Have a question about Architectural Concierge, need help with a project,
            or want to partner with us? Send us a message or find us on the map below.
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact form */}
            <ContactForm/>
            {/* Map + contact info */}
            <div className="space-y-4">
              <div className="card overflow-hidden">
                {/* Replace src with your own Google Maps embed URL */}
                <iframe
                  title="Office location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.012792432232!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9a3e5fb%3A0x8b1d1d3e583f5b0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-3">Our Office</h2>
                <p className="text-gray-600 mb-2">
                  Bengaluru, Karnataka, India
                </p>
                <p className="text-gray-600">
                  Email:{' '}
                  <a href="mailto:support@architecturalconcierge.com" className="text-primary font-semibold">
                    support@architecturalconcierge.com
                  </a>
                  <br />
                  Phone: +91-98765-43210
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}