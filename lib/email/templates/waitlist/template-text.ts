import { appName } from '../../client';

export function generateWaitlistEmailText() {
  return `
Welcome to the ${appName} Waitlist!

Thanks for joining our waitlist! 🎉

We're building something special for communities like yours. You'll be among the first to know when ${appName} launches.

What to expect:
- Early access to ${appName}
- Exclusive updates on our progress
- A chance to shape the product

In the meantime, stay tuned for updates!

Want to learn more about ${appName}? Visit our homepage to discover how we're helping communities thrive.

Learn more: https://tribehq.io

The ${appName} Team

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}
