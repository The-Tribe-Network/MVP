import { withSentryConfig } from "@sentry/nextjs/config"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

// Sentry's build step only uploads source maps (readable server stack traces). Without SENTRY_AUTH_TOKEN it is
// skipped and quiet, so a build never depends on Sentry. Runtime reporting is set up in instrumentation.ts.
const uploadSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN)

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !uploadSourceMaps,
  telemetry: false,
  sourcemaps: {
    disable: !uploadSourceMaps,
  },
})
