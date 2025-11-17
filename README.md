# Complete Authentication System with Better-Auth

A production-ready, full-stack authentication system built with Next.js 15, TypeScript, Better-Auth, and modern web technologies. Features comprehensive email authentication, OAuth integration, OTP verification, and a beautiful UI built with shadcn/ui components.

## ✨ Features

### 🔐 Authentication Methods
- ✅ **Email/Password Authentication** - Traditional sign-in with validation
- ✅ **OAuth Integration** - Google and GitHub social login
- ✅ **Magic Link Authentication** - Passwordless email-based sign-in
- ✅ **OTP Verification** - 6-digit code verification for sign-up and password reset
- ✅ **Username Support** - Optional username field for user profiles

### 📧 Email System
- ✅ **Comprehensive Email Templates** - Beautiful HTML emails with Resend integration
- ✅ **Email Verification** - Sign-up verification with secure tokens
- ✅ **Password Reset Flow** - Secure password reset via email
- ✅ **Welcome Emails** - Post-verification welcome messages
- ✅ **Magic Link Emails** - Passwordless authentication emails
- ✅ **OTP Emails** - Verification codes for sign-up and password reset

### 🎨 User Interface
- ✅ **Modern UI Components** - Built with shadcn/ui and Radix UI
- ✅ **Responsive Design** - Mobile-first responsive layout
- ✅ **Dark/Light Theme** - Theme switching with next-themes
- ✅ **Form Validation** - Real-time validation with react-hook-form and Zod
- ✅ **Loading States** - Proper loading indicators and error handling
- ✅ **Toast Notifications** - User feedback with Sonner

### 🛡️ Security & Performance
- ✅ **Session Management** - Secure session handling with Better-Auth
- ✅ **CSRF Protection** - Built-in CSRF token validation
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **TypeScript** - Full type safety throughout the application
- ✅ **Database Agnostic** - PostgreSQL, MySQL, SQLite support
- ✅ **Production Ready** - Optimized for production deployment

## 🛣️ Authentication Routes

| Route | Description | Features |
|-------|-------------|----------|
| `/sign-in` | Sign in with email/password or OAuth | Email/Password, OAuth, Magic Link, OTP |
| `/sign-up` | Create new account with validation | Email verification, Username support |
| `/forgot` | Request password reset email | Email-based password reset flow |
| `/reset` | Reset password with token | Secure token-based password reset |
| `/verify` | OTP verification page | 6-digit code verification for sign-up/password reset |
| `/dashboard` | Protected dashboard | Session management, user profile |
| `/api/auth/[...all]` | Better-Auth API endpoint | Handles all authentication operations |

## 🏗️ Project Structure

```
auth-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── sign-in/page.tsx      # Sign-in page
│   │   ├── sign-up/page.tsx      # Sign-up page
│   │   ├── forgot/page.tsx       # Forgot password
│   │   ├── reset/page.tsx        # Reset password
│   │   └── verify/page.tsx       # OTP verification
│   ├── (protected)/              # Protected route group
│   │   └── dashboard/            # Dashboard pages
│   └── api/auth/[...all]/        # Auth API routes
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   │   ├── forms/                # Form components
│   │   └── *.tsx                 # Auth-specific components
│   ├── ui/                       # shadcn/ui components
│   └── sidebar/                  # Navigation components
├── lib/                          # Utility libraries
│   ├── clients/                  # External service clients
│   │   ├── auth.ts               # Better-Auth configuration
│   │   ├── db.ts                 # Database client
│   │   └── resend.ts             # Email service client
│   ├── email/                    # Email system
│   │   ├── magic-link/           # Magic link emails
│   │   ├── otp-*/                # OTP email templates
│   │   ├── password-reset/       # Password reset emails
│   │   └── welcome/              # Welcome emails
│   ├── database/                 # Database schema
│   ├── hooks/                    # Custom React hooks
│   ├── providers/                # React context providers
│   └── validations/              # Form validation schemas
└── public/                       # Static assets
```

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd auth-system

# Install dependencies using pnpm (recommended) or npm
pnpm install
# or
npm install
\`\`\`

### 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

\`\`\`env
# Better Auth Configuration
BETTER_AUTH_SECRET=your_better_auth_secret_here_generate_a_random_string
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@localhost:5432/auth_system

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Auth System

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Database Setup

The project uses PostgreSQL with Drizzle ORM. Set up your database:

\`\`\`bash
# Generate database migrations
pnpm run generate-auth

# Run migrations
pnpm run migrate-auth
\`\`\`

For development, you can also use SQLite by updating the `DATABASE_URL`:
\`\`\`env
DATABASE_URL=file:./auth.db
\`\`\`

### 4. Email Service Setup (Resend)

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Get your API key**: In the Resend dashboard, go to API Keys and create a new key
3. **Add your domain**: In the Domains section, add and verify your domain
4. **Set up the from email**: Use an email address from your verified domain

### 5. Generate Better-Auth Secret

Generate a secure random string for `BETTER_AUTH_SECRET`:

\`\`\`bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any secure random string generator
\`\`\`

### 6. OAuth Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 7. Run the Development Server

\`\`\`bash
# Start the development server
pnpm run dev
# or
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your authentication system in action!

## 📧 Email System

This project includes a comprehensive email system with beautiful HTML templates and Resend integration. The email system is modular and organized for easy customization.

### Available Email Types

| Email Type | Purpose | Trigger | Features |
|------------|---------|---------|----------|
| **Sign-up Verification** | Verify new user email addresses | User signs up with email/password | Welcome message, verification button, security notice |
| **Password Reset** | Allow users to reset forgotten passwords | User requests password reset | Reset button, security notice, expiration warning |
| **Welcome Email** | Welcome users after email verification | After successful email verification | Getting started guide, feature highlights, login button |
| **Magic Link** | Passwordless authentication | User requests magic link sign-in | Sign-in button, security notice, expiration warning |
| **OTP Email Verification** | Verify email with 6-digit code | User signs up and OTP verification is enabled | 6-digit code, expiration warning, security notice |
| **OTP Password Reset** | Reset password with 6-digit code | User requests password reset with OTP | 6-digit code, expiration warning, security notice |
| **OTP Sign-in** | Sign in with 6-digit code | User requests OTP sign-in | 6-digit code, expiration warning, security notice |

### Email Template Structure

Each email type follows a consistent structure:
- **HTML Template** - Beautiful responsive design with inline CSS
- **Text Fallback** - Plain text version for email clients
- **TypeScript Types** - Type-safe email data interfaces
- **Sending Function** - Resend integration with error handling

### Customization

#### Styling
- **Colors**: Update gradient backgrounds in `.header` styles
- **Fonts**: Change `font-family` in body styles  
- **Layout**: Modify padding, margins, and spacing
- **Branding**: Update app name and colors to match your brand

#### Content
- User names and personalization
- Custom URLs and links
- App-specific messaging
- Call-to-action buttons

### Adding New Email Types

To add a new email type:

1. **Create folder**: `lib/email/new-email-type/`
2. **Add files**:
   - `types.ts` - TypeScript interfaces
   - `template-html.ts` - HTML template
   - `template-text.ts` - Text fallback
   - `send-new-email-type.ts` - Main function
3. **Update exports**: Add to `email.ts` and `index.ts`
4. **Update auth**: Add to Better Auth configuration

## Better-Auth Features

This implementation leverages Better-Auth's powerful features:

- **Unified API** - Single endpoint handles all authentication flows
- **Built-in Security** - CSRF protection, secure sessions, and more
- **OAuth Integration** - Simplified OAuth setup with multiple providers
- **Session Management** - Automatic session handling and refresh
- **Type Safety** - Full TypeScript support with inferred types
- **Database Agnostic** - Works with SQLite, PostgreSQL, MySQL, and more

## Authentication Flow

### Email/Password Authentication
1. User submits credentials via sign-in or sign-up form
2. Better-Auth validates and creates/authenticates user
3. Session is automatically created and managed
4. User is redirected to dashboard with active session

### OAuth Authentication
1. User clicks OAuth provider button
2. Better-Auth redirects to provider's authorization page
3. Provider redirects back with authorization code
4. Better-Auth exchanges code for user information
5. User account is created/linked and session established

### Password Reset
1. User requests password reset via forgot password form
2. Better-Auth sends secure reset email with token
3. User clicks link and is redirected to reset page
4. New password is set using the secure token

## Security Features

- **CSRF Protection** - Built-in CSRF token validation
- **Secure Sessions** - HTTP-only cookies with proper security headers
- **Password Hashing** - Automatic secure password hashing
- **Rate Limiting** - Built-in protection against brute force attacks
- **Token Security** - Secure password reset and email verification tokens
- **OAuth Security** - Proper state validation and secure token exchange

## Customization

### Database Configuration
Update `lib/auth.ts` to change database provider:

\`\`\`typescript
export const auth = betterAuth({
  database: {
    provider: "postgresql", // or "mysql", "sqlite"
    url: process.env.DATABASE_URL,
  },
  // ... other config
})
\`\`\`

### Adding OAuth Providers
Add new providers in `lib/auth.ts`:

\`\`\`typescript
socialProviders: {
  google: { /* config */ },
  github: { /* config */ },
  discord: { /* add new provider */ },
}
\`\`\`

### Custom Validation
Better-Auth handles most validation automatically, but you can add custom validation in the form components.

## Production Deployment

Before deploying to production:

1. **Database**: Set up a production database (PostgreSQL recommended)
2. **Environment Variables**: Update all environment variables for production
3. **OAuth Apps**: Configure OAuth apps with production callback URLs
4. **Security**: Ensure `BETTER_AUTH_SECRET` is a strong, unique value
5. **Email Service**: Configure email provider for password resets (if needed)
6. **Domain**: Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to production domain

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 19** - Latest React with concurrent features

### Authentication & Database
- **Better-Auth** - Modern authentication library
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Primary database (SQLite for development)
- **Neon Database** - Serverless PostgreSQL provider

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Unstyled, accessible UI primitives
- **next-themes** - Theme switching (dark/light mode)
- **Lucide React** - Beautiful icon library

### Forms & Validation
- **react-hook-form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation resolvers

### State Management & Data Fetching
- **TanStack Query** - Server state management
- **Zustand** - Lightweight state management
- **Immer** - Immutable state updates

### Email & External Services
- **Resend** - Developer-friendly email API
- **Better-Auth Plugins** - Email OTP, username support

### Development Tools
- **Drizzle Kit** - Database migrations and introspection
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |
| `pnpm run lint` | Run ESLint |
| `pnpm run generate-auth` | Generate Better-Auth migrations |
| `pnpm run migrate-auth` | Run database migrations |

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify** - Full-stack deployment
- **Railway** - Database and app hosting
- **DigitalOcean App Platform** - Simple deployment
- **AWS/GCP/Azure** - Enterprise deployment

### Environment Variables for Production

Make sure to set these in your production environment:
- All variables from `.env.local`
- Update URLs to production domains
- Use production database
- Configure OAuth apps with production URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Documentation

- [Better-Auth Documentation](https://better-auth.com) - Complete authentication guide
- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [shadcn/ui](https://ui.shadcn.com) - UI components documentation
- [Resend Documentation](https://resend.com/docs) - Email service guide

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues**
- Ensure your `DATABASE_URL` is correct
- Check if your database server is running
- Verify database credentials

**Email Not Sending**
- Check your Resend API key
- Verify your domain is configured in Resend
- Check email quotas and limits

**OAuth Not Working**
- Verify OAuth app configuration
- Check redirect URLs match exactly
- Ensure environment variables are set

**Build Errors**
- Clear `.next` folder and rebuild
- Check for TypeScript errors
- Verify all dependencies are installed

## 📄 License

MIT License - feel free to use this in your projects!

## 🙏 Acknowledgments

- [Better-Auth](https://better-auth.com) for the amazing authentication library
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Vercel](https://vercel.com) for the Next.js framework
- [Resend](https://resend.com) for the email service
