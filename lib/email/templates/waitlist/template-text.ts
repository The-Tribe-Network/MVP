import { appName } from '../../client';

export function generateWaitlistEmailText({
  to
}: {
  to: string;
}) {
  const surveyUrl = `https://tribehq.io/survey?email=${encodeURIComponent(to)}`;

  return `
Welcome to the ${appName} Waitlist!

Thanks for joining our waitlist! 🎉

We're building something special for communities like yours. You'll be among the first to know when ${appName} launches.

What to expect:
- Early access to ${appName}
- Exclusive updates on our progress
- A chance to shape the product

Help us build ${appName} for you!

Take our quick 2-minute survey to share your needs. Your feedback will directly shape the features we build.

Take the survey: ${surveyUrl}

The ${appName} Team

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}
