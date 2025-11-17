import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';
export const appName = process.env.APP_NAME || 'Auth System';
export const appUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
