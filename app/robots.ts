import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://tribecommunity.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/tribe/",
          "/settings/",
          "/profile/",
          "/welcome/",
          "/new/",
          "/discover/",
          "/verify/",
          "/reset/",
          "/forgot/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
