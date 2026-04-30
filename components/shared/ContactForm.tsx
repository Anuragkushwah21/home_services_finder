'use client';

import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

interface ContactFormProps {
  vendorId?: string;
  serviceId?: string;
  onSuccess?: () => void;
}

export default function ContactForm({
  vendorId,
  serviceId,
  onSuccess,
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Optional: quick front-end validation for nicer messages
      if (!formData.name.trim())
        throw new Error('Name is required');
      if (!formData.email.trim())
        throw new Error('Email is required');
      if (!formData.phone.trim())
        throw new Error('Phone is required');
      if (!formData.subject.trim())
        throw new Error('Subject is required');
      if (!formData.message.trim() || formData.message.trim().length < 10)
        throw new Error('Message must be at least 10 characters');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vendorId,
          serviceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });

      toast.success('Message sent successfully!');

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
        <p className="text-green-700">
          Thank you for contacting us. We&apos;ll get back to you within 24-48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
      <p className="text-gray-600 mb-6">
        Have a question? We&apos;d love to hear from you. Send us a message and we&apos;ll
        respond as soon as possible.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-sm mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-sm mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-sm mb-2">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
              setFormData((prev) => ({
                ...prev,
                phone: digits,
              }));
            }}
            className="input-field"
            placeholder="9876543210"
            maxLength={10}
            required
          />
        </div>

        <div>
          <label className="block font-bold text-sm mb-2">Subject *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input-field"
            placeholder="How can we help?"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-sm mb-2">Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="input-field resize-none"
            rows={5}
            placeholder="Tell us more about your inquiry..."
            required
            minLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 10 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="font-bold text-lg mb-4">Other Ways to Reach Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-sm">Phone</p>
              <p className="text-gray-600">+91 (123) 456-7890</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-sm">Email</p>
              <p className="text-gray-600">support@architecturalconcierge.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}