import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo-config";

// Dynamic sitemap generation for better SEO
// This will be accessible at /sitemap.xml

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic vehicle pages - fetch from API
  // Uncomment and modify when API is available
  /*
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles?limit=1000`);
    const data = await response.json();
    
    const vehiclePages: MetadataRoute.Sitemap = data.vehicles.map((vehicle: { id: string; updatedAt: string }) => ({
      url: `${baseUrl}/vehicles/${vehicle.id}`,
      lastModified: new Date(vehicle.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
    
    return [...staticPages, ...vehiclePages];
  } catch (error) {
    console.error("Error fetching vehicles for sitemap:", error);
    return staticPages;
  }
  */

  return staticPages;
}
