import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contact from '@/lib/models/contact';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      serviceId,
      vendorId,
    } = await req.json();

    // const userEmail = req.headers.get('x-user-email'); // remove if unused

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const digitsOnly = phone.replace(/\D/g, '');
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(digitsOnly)) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const contact = new Contact({
      name,
      email: email.toLowerCase(),
      phone: digitsOnly,
      subject,
      message,
      serviceId: serviceId || undefined,
      vendorId: vendorId || undefined,
      status: 'new',
    });

    await contact.save();

    try {
      await sendEmail({
        to: email,
        subject: `We received your message: ${subject}`,
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Hi ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p><strong>Your Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p>Our team will review your request and respond within 24-48 hours.</p>
          <p>Best regards,<br>Architectural Concierge Team</p>
        `,
      });
    } catch (emailErr) {
      console.error('Error sending confirmation email:', emailErr);
    }

    try {
      await sendEmail({
        to: process.env.EMAIL_USER || 'admin@architecturalconcierge.com',
        subject: `New Contact Message: ${subject}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Phone:</strong> ${digitsOnly}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          ${serviceId ? `<p><strong>Service ID:</strong> ${serviceId}</p>` : ''}
          ${vendorId ? `<p><strong>Vendor ID:</strong> ${vendorId}</p>` : ''}
        `,
      });
    } catch (emailErr) {
      console.error('Error sending admin notification:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully. We will get back to you soon!',
        data: contact,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating contact:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET stays unchanged
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');

    await connectDB();

    const query: Record<string, unknown> = {};
    if (vendorId) query.vendorId = vendorId;
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .populate('serviceId', 'name')
      .populate('vendorId', 'businessName')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}