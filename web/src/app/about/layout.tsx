import type { Metadata } from "next";
import { pagesSeo, siteConfig, structuredData } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: pagesSeo.about.title,
  description: pagesSeo.about.description,
  keywords: pagesSeo.about.keywords,
  alternates: {
    canonical: `${siteConfig.url}${pagesSeo.about.canonicalPath}`,
  },
  openGraph: {
    title: pagesSeo.about.title,
    description: pagesSeo.about.description,
    url: `${siteConfig.url}${pagesSeo.about.canonicalPath}`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: "/about_hero.png",
        width: 1200,
        height: 630,
        alt: "About Punchi Car Niwasa - Sri Lanka's Largest Vehicle Park",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pagesSeo.about.title,
    description: pagesSeo.about.description,
    images: ["/about_hero.png"],
  },
};

// Structured data for about page
const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Punchi Car Niwasa",
  description: pagesSeo.about.description,
  url: `${siteConfig.url}/about`,
  mainEntity: {
    "@id": `${siteConfig.url}/#organization`,
  },
  breadcrumb: structuredData.breadcrumbList([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]),
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutPageSchema),
        }}
      />
      {children}
    </>
  );
}
