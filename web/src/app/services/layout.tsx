import type { Metadata } from "next";
import { pagesSeo, siteConfig, structuredData } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: pagesSeo.services.title,
  description: pagesSeo.services.description,
  keywords: pagesSeo.services.keywords,
  alternates: {
    canonical: `${siteConfig.url}${pagesSeo.services.canonicalPath}`,
  },
  openGraph: {
    title: pagesSeo.services.title,
    description: pagesSeo.services.description,
    url: `${siteConfig.url}${pagesSeo.services.canonicalPath}`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: "/service_page.png",
        width: 1200,
        height: 630,
        alt: "Our Services - Punchi Car Niwasa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pagesSeo.services.title,
    description: pagesSeo.services.description,
    images: ["/service_page.png"],
  },
};

// Structured data for services
const servicesSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteConfig.url}/services#buy-vehicle`,
    name: "Buy Quality Used Vehicles",
    description: "Browse and purchase from our collection of 400+ quality inspected used vehicles",
    provider: {
      "@id": `${siteConfig.url}/#organization`,
    },
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    serviceType: "Vehicle Sales",
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteConfig.url}/services#sell-vehicle`,
    name: "Sell Your Vehicle",
    description: "Sell your vehicle through our transparent and trusted platform",
    provider: {
      "@id": `${siteConfig.url}/#organization`,
    },
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    serviceType: "Vehicle Consignment",
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteConfig.url}/services#inspection`,
    name: "Vehicle Inspection",
    description: "Comprehensive vehicle inspection and document verification services",
    provider: {
      "@id": `${siteConfig.url}/#organization`,
    },
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    serviceType: "Vehicle Inspection",
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteConfig.url}/services#financing`,
    name: "Vehicle Financing",
    description: "Leasing and financing assistance for vehicle purchases",
    provider: {
      "@id": `${siteConfig.url}/#organization`,
    },
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    serviceType: "Vehicle Financing",
  },
];

const servicesPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Our Services",
  description: pagesSeo.services.description,
  url: `${siteConfig.url}/services`,
  breadcrumb: structuredData.breadcrumbList([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
  ]),
  mainEntity: servicesSchema,
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesPageSchema),
        }}
      />
      {servicesSchema.map((service, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(service),
          }}
        />
      ))}
      {children}
    </>
  );
}
