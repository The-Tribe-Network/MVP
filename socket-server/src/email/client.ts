import { Resend } from 'resend';

const { RESEND_API_KEY } = process.env;

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resendClient = new Resend(RESEND_API_KEY);

export const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';
export const appName = process.env.APP_NAME || 'Tribe';
export const appUrl = process.env.APP_URL || 'http://localhost:3000';