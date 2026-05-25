import { MetadataRoute } from "next";
import { SITE } from "@/config/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
