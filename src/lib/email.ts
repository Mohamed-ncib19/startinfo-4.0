import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@startinfo.com',
    to: email,
    subject: 'Verify your StartInfo account',
    html: `
      <h1>Welcome to StartInfo!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for registering with StartInfo. Please click the button below to verify your email address:</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account with StartInfo, please ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@startinfo.com',
    to: email,
    subject: 'Reset your StartInfo password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `,
  });
}

export async function sendCertificateEmail(email: string, name: string, courseName: string, certificateUrl: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@startinfo.com',
    to: email,
    subject: `Your StartInfo Certificate for ${courseName}`,
    html: `
      <h1>Congratulations!</h1>
      <p>Hi ${name},</p>
      <p>You've successfully completed the ${courseName} course! Your certificate is ready to download:</p>
      <p>
        <a href="${certificateUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Download Certificate
        </a>
      </p>
      <p>Keep up the great work!</p>
    `,
  });
}
