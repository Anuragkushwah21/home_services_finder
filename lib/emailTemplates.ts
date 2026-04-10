export const otpEmailTemplate = (otp: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px;">
      <h1 style="color: white; margin: 0;">Architectural Concierge</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0;">Premium Services Marketplace</p>
    </div>
    
    <div style="padding: 30px; background: #f5f5f5;">
      <h2 style="color: #333; text-align: center;">Your Login Code</h2>
      <p style="color: #666; text-align: center;">Use this code to sign in to your account. This code expires in 10 minutes.</p>
      
      <div style="background: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #999;">Enter this code:</p>
        <p style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 10px 0;">${otp}</p>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
    
    <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">© 2024 Architectural Concierge. All rights reserved.</p>
    </div>
  </div>
`;

export const bookingConfirmationTemplate = (bookingDetails: {
  serviceName: string;
  vendor: string;
  date: string;
  time: string;
  location: string;
}): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px;">
      <h1 style="color: white; margin: 0;">Booking Confirmed</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0;">Your service is booked!</p>
    </div>
    
    <div style="padding: 30px; background: #f5f5f5;">
      <h2 style="color: #333; margin-bottom: 20px;">Booking Details</h2>
      
      <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0;"><strong>Service:</strong> ${bookingDetails.serviceName}</p>
        <p style="margin: 0 0 10px 0;"><strong>Vendor:</strong> ${bookingDetails.vendor}</p>
        <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${bookingDetails.date}</p>
        <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${bookingDetails.time}</p>
        <p style="margin: 0;"><strong>Location:</strong> ${bookingDetails.location}</p>
      </div>
      
      <p style="color: #666; text-align: center;">
        Check your dashboard for more details and updates.
      </p>
    </div>
    
    <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">© 2024 Architectural Concierge. All rights reserved.</p>
    </div>
  </div>
`;

export const vendorApprovalTemplate = (vendorName: string, status: 'approved' | 'rejected'): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px;">
      <h1 style="color: white; margin: 0;">Vendor Application ${status === 'approved' ? 'Approved' : 'Update'}</h1>
    </div>
    
    <div style="padding: 30px; background: #f5f5f5;">
      <h2 style="color: #333;">Hello ${vendorName},</h2>
      
      ${status === 'approved' ? `
        <p style="color: #666;">Congratulations! Your vendor application has been approved.</p>
        <p style="color: #666;">You can now start adding services to your profile and accepting bookings.</p>
      ` : `
        <p style="color: #666;">Thank you for your application. Our team is reviewing your information.</p>
        <p style="color: #666;">We'll notify you once the review is complete.</p>
      `}
      
      <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
        <a href="https://architecturalconcierge.com/vendor/dashboard" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Go to Dashboard
        </a>
      </div>
    </div>
    
    <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666;">
      <p style="margin: 0;">© 2024 Architectural Concierge. All rights reserved.</p>
    </div>
  </div>
`;
