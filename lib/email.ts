import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true only if you're using port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Your Architectural Concierge Login Code",
      html: `
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
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send OTP email");
  }
};

// generic helper used by APIs
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    // your SMTP config here
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export const generateOTP = (length: number = 6): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * 10));
  }
  return otp;
};