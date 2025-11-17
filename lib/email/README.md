# Email System Architecture

This directory contains a modular email system for Better Auth integration with Resend. Each email type is organized in its own folder for better maintainability and separation of concerns.

## 📁 Directory Structure

```
lib/email/
├── index.ts                    # Main exports file
├── email.ts                    # Re-exports all email functions
├── README.md                   # This documentation
├── sign-up-verification/       # Email verification for new signups
│   ├── types.ts               # TypeScript interfaces
│   ├── template-html.ts       # HTML email template
│   ├── template-text.ts       # Plain text fallback
│   └── send-verification-email.ts # Main sending function
├── password-reset/            # Password reset emails
│   ├── types.ts
│   ├── template-html.ts
│   ├── template-text.ts
│   └── send-password-reset-email.ts
├── welcome/                   # Welcome emails after verification
│   ├── types.ts
│   ├── template-html.ts
│   ├── template-text.ts
│   └── send-welcome-email.ts
└── magic-link/               # Magic link authentication
    ├── types.ts
    ├── template-html.ts
    ├── template-text.ts
    └── send-magic-link-email.ts
```

## 🚀 Usage

### Basic Usage (Recommended)
```typescript
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendMagicLinkEmail 
} from '@/lib/email';

// Send verification email
await sendVerificationEmail({
  to: 'user@example.com',
  verificationUrl: 'https://app.com/verify?token=abc123',
  userName: 'John Doe'
});
```

### Advanced Usage (Direct Access)
```typescript
// Import specific email functions
import { sendVerificationEmail } from '@/lib/email/sign-up-verification/send-verification-email';

// Import just templates
import { generateVerificationEmailHtml } from '@/lib/email/sign-up-verification/template-html';
```

## 📧 Email Types

### 1. Sign-up Verification
- **Purpose**: Verify new user email addresses
- **Trigger**: User signs up with email/password
- **Expiration**: 24 hours
- **Features**: Welcome message, verification button, security notice

### 2. Password Reset
- **Purpose**: Allow users to reset forgotten passwords
- **Trigger**: User requests password reset
- **Expiration**: 1 hour
- **Features**: Reset button, security notice, expiration warning

### 3. Welcome Email
- **Purpose**: Welcome users after email verification
- **Trigger**: After successful email verification
- **Features**: Getting started guide, feature highlights, login button

### 4. Magic Link
- **Purpose**: Passwordless authentication
- **Trigger**: User requests magic link sign-in
- **Expiration**: 10 minutes
- **Features**: Sign-in button, security notice, expiration warning

## 🎨 Customization

### Styling
Each email template uses inline CSS and can be customized by editing the respective `template-html.ts` files:

- **Colors**: Update gradient backgrounds in `.header` styles
- **Fonts**: Change `font-family` in body styles
- **Layout**: Modify padding, margins, and spacing
- **Branding**: Update app name and colors

### Content
Templates accept parameters for customization:
- User names
- URLs and links
- App-specific messaging
- Call-to-action buttons

## 🔧 Adding New Email Types

To add a new email type:

1. **Create folder**: `lib/email/new-email-type/`
2. **Add files**:
   - `types.ts` - TypeScript interfaces
   - `template-html.ts` - HTML template
   - `template-text.ts` - Text fallback
   - `send-new-email-type.ts` - Main function
3. **Update exports**: Add to `email.ts` and `index.ts`
4. **Update auth**: Add to Better Auth configuration

### Example Structure
```typescript
// types.ts
export interface NewEmailData {
  to: string;
  customField: string;
}

// template-html.ts
export function generateNewEmailHtml({ to, customField }: NewEmailData) {
  return `<!DOCTYPE html>...`;
}

// send-new-email-type.ts
export async function sendNewEmail(data: NewEmailData) {
  // Implementation
}
```

## 🧪 Testing

### Test Individual Emails
```typescript
import { sendVerificationEmail } from '@/lib/email';

// Test verification email
await sendVerificationEmail({
  to: 'test@example.com',
  verificationUrl: 'https://localhost:3000/verify?token=test',
  userName: 'Test User'
});
```

### Test All Emails
Use the test utility:
```bash
npx tsx lib/utils/test-email.ts
```

## 🔒 Security Features

- **Link Expiration**: All authentication links have expiration times
- **HTTPS Only**: Production URLs must use HTTPS
- **Email Validation**: All email addresses are validated
- **Rate Limiting**: Resend provides built-in rate limiting
- **Environment Variables**: Sensitive data stored in environment variables

## 📱 Responsive Design

All email templates are designed to work across:
- Desktop email clients (Outlook, Thunderbird)
- Web-based clients (Gmail, Yahoo)
- Mobile email apps
- Text-only clients (fallback support)

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check `RESEND_API_KEY` environment variable
2. **"Unauthorized"**: Verify your domain in Resend dashboard
3. **Emails not sending**: Check Resend dashboard for error logs
4. **Templates not rendering**: Verify HTML syntax and inline CSS

### Debug Mode
Enable logging in your auth configuration:
```typescript
sendEmailVerification: async ({ user, verificationUrl }) => {
  console.log('Sending verification email to:', user.email);
  // ... rest of implementation
}
```

## 📚 Related Documentation

- [Resend Documentation](https://resend.com/docs)
- [Better Auth Documentation](https://better-auth.com)
- [Email Template Best Practices](https://resend.com/docs/email-best-practices)
