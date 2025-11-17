# Email Setup with Resend

This document explains how to set up and configure Resend email service with your Better Auth application.

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY="re_your-resend-api-key-here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
APP_NAME="Auth System"

# Better Auth (if not already configured)
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Getting Started with Resend

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Get your API key**: In the Resend dashboard, go to API Keys and create a new key
3. **Add your domain**: In the Domains section, add and verify your domain
4. **Set up the from email**: Use an email address from your verified domain

## Email Templates

The following email templates are available:

### 1. Email Verification
- **Trigger**: When a user signs up and email verification is required
- **Template**: `sendVerificationEmail()`
- **Features**: Welcome message, verification button, security notice

### 2. Password Reset
- **Trigger**: When a user requests a password reset
- **Template**: `sendPasswordResetEmail()`
- **Features**: Reset button, security notice, expiration warning

### 3. Welcome Email
- **Trigger**: After successful email verification
- **Template**: `sendWelcomeEmail()`
- **Features**: Welcome message, getting started guide, login button

### 4. Magic Link
- **Trigger**: When a user requests a magic link sign-in
- **Template**: `sendMagicLinkEmail()`
- **Features**: Sign-in button, security notice, expiration warning

## Customization

### Styling
All email templates use inline CSS and are designed to work across different email clients. You can customize:

- Colors: Update the gradient backgrounds in the `.header` styles
- Fonts: Change the `font-family` in the body styles
- Layout: Modify padding, margins, and spacing
- Branding: Update the app name and colors to match your brand

### Content
Each template function accepts parameters that allow you to customize:

- User names
- URLs and links
- App-specific messaging
- Call-to-action buttons

### Adding New Templates

To add a new email template:

1. Create a new function in `lib/utils/email.ts`
2. Add the corresponding HTML and text template functions
3. Import and use the function in your Better Auth configuration

## Testing

### Local Development
1. Set up Resend with a test API key
2. Use a verified domain or the Resend sandbox domain
3. Test emails will be sent to your configured email address

### Production
1. Verify your production domain in Resend
2. Update the `RESEND_FROM_EMAIL` to use your verified domain
3. Monitor email delivery in the Resend dashboard

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check that your `RESEND_API_KEY` is correct
2. **"Unauthorized"**: Ensure your domain is verified in Resend
3. **Emails not sending**: Check the Resend dashboard for error logs
4. **Templates not rendering**: Verify HTML syntax and inline CSS

### Debug Mode

Add logging to see email sending status:

```typescript
// In your auth configuration
sendEmailVerification: async ({ user, verificationUrl }) => {
  console.log('Sending verification email to:', user.email);
  try {
    const result = await sendVerificationEmail({
      to: user.email,
      verificationUrl,
      userName: user.name || undefined,
    });
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
},
```

## Security Best Practices

1. **Rate limiting**: Resend has built-in rate limiting
2. **Email validation**: Always validate email addresses before sending
3. **Link expiration**: All authentication links have expiration times
4. **HTTPS**: Always use HTTPS in production URLs
5. **Environment variables**: Never commit API keys to version control

## Support

- [Resend Documentation](https://resend.com/docs)
- [Better Auth Documentation](https://better-auth.com)
- [Email Template Best Practices](https://resend.com/docs/email-best-practices)
