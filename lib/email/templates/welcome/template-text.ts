import { appName } from '../../client';

export function generateWelcomeEmailText({ 
  userName, 
  loginUrl 
}: { 
  userName: string; 
  loginUrl: string; 
}) {
  return `
Welcome to ${appName}!

Hi ${userName},

Welcome to ${appName}! We're excited to have you on board. Your account has been successfully created and verified.

What's next?
- Complete your profile setup
- Explore our features and tools
- Connect with other users
- Start building amazing things!

Get started here: ${loginUrl}

If you have any questions or need help getting started, don't hesitate to reach out to our support team.

Happy building!
The ${appName} Team

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}
