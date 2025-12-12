import type { Metadata } from "next";
import { pagesSeo, siteConfig, structuredData } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: pagesSeo.contact.title,
  description: pagesSeo.contact.description,
  keywords: pagesSeo.contact.keywords,
  alternates: {
    canonical: `${siteConfig.url}${pagesSeo.contact.canonicalPath}`,
  },
  openGraph: {
    title: pagesSeo.contact.title,
    description: pagesSeo.contact.description,
    url: `${siteConfig.url}${pagesSeo.contact.canonicalPath}`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: "/og-contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Punchi Car Niwasa - Malabe Vehicle Park",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pagesSeo.contact.title,
    description: pagesSeo.contact.description,
    images: ["/og-contact.jpg"],
  },
};

// Structured data for contact page with LocalBusiness
const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Us",
  description: pagesSeo.contact.description,
  url: `${siteConfig.url}/contact`,
  mainEntity: structuredData.localBusiness,
  breadcrumb: structuredData.breadcrumbList([
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ]),
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.localBusiness),
        }}
      />
      {children}
    </>
  );
}
