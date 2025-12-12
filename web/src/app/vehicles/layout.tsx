import type { Metadata } from "next";
import { pagesSeo, siteConfig, structuredData, faqContent } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: pagesSeo.vehicles.title,
  description: pagesSeo.vehicles.description,
  keywords: pagesSeo.vehicles.keywords,
  alternates: {
    canonical: `${siteConfig.url}${pagesSeo.vehicles.canonicalPath}`,
  },
  openGraph: {
    title: pagesSeo.vehicles.title,
    description: pagesSeo.vehicles.description,
    url: `${siteConfig.url}${pagesSeo.vehicles.canonicalPath}`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: "/og-vehicles.jpg",
        width: 1200,
        height: 630,
        alt: "Quality Used Vehicles at Punchi Car Niwasa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pagesSeo.vehicles.title,
    description: pagesSeo.vehicles.description,
    images: ["/og-vehicles.jpg"],
  },
};

// Structured data for vehicle listing page
const vehicleListingSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Available Vehicles",
  description: pagesSeo.vehicles.description,
  url: `${siteConfig.url}/vehicles`,
  isPartOf: {
    "@id": `${siteConfig.url}/#website`,
  },
  about: {
    "@type": "ItemList",
    name: "Quality Used Vehicles",
    description: "Browse 400+ quality used vehicles at Sri Lanka's largest vehicle park",
    numberOfItems: 400,
  },
  breadcrumb: structuredData.breadcrumbList([
    { name: "Home", url: "/" },
    { name: "Vehicles", url: "/vehicles" },
  ]),
};

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vehicleListingSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.faqPage(faqContent)),
        }}
      />
      {children}
    </>
  );
}
