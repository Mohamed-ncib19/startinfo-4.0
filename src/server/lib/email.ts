import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendCertificateEmail(
  email: string,
  name: string,
  courseName: string,
  certificateUrl: string
) {
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