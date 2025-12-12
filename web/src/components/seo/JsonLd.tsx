'use client';

import { generateVehicleSchema } from "@/lib/seo-config";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  images?: string[];
}

interface VehicleJsonLdProps {
  vehicle: Vehicle;
}

// JSON-LD component for individual vehicle pages
export function VehicleJsonLd({ vehicle }: VehicleJsonLdProps) {
  const schema = generateVehicleSchema({
    name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    mileage: vehicle.mileage,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    image: vehicle.images?.[0] || "/og-image.jpg",
    url: `/vehicles/${vehicle.id}`,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// Breadcrumb JSON-LD component
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const baseUrl = "https://www.punchicar.lk";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// FAQ JSON-LD component
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  faqs: FAQItem[];
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// Product/Vehicle listing JSON-LD for search results
interface VehicleListJsonLdProps {
  vehicles: Vehicle[];
  totalCount: number;
}

export function VehicleListJsonLd({ vehicles, totalCount }: VehicleListJsonLdProps) {
  const baseUrl = "https://www.punchicar.lk";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Available Vehicles at Punchi Car Niwasa",
    description: "Browse our collection of quality used vehicles",
    numberOfItems: totalCount,
    itemListElement: vehicles.slice(0, 10).map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Car",
        name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        url: `${baseUrl}/vehicles/${vehicle.id}`,
        image: vehicle.images?.[0] || "/og-image.jpg",
        offers: {
          "@type": "Offer",
          price: vehicle.price,
          priceCurrency: "LKR",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// Organization JSON-LD (for pages that need it separately)
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "Punchi Car Niwasa",
    alternateName: "පුංචි කාර් නිවස",
    url: "https://www.punchicar.lk",
    logo: "https://www.punchicar.lk/logo_icon.png",
    description: "Sri Lanka's largest vehicle park with 400+ quality used cars",
    telephone: "+94 112 413 865",
    email: "sales@punchicar.lk",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Vehicle Park",
      addressLocality: "Malabe",
      addressCountry: "LK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "6.9147",
      longitude: "79.9710",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: [
      "https://www.facebook.com/punchicar",
      "https://www.instagram.com/punchicar",
      "https://www.youtube.com/@punchicarniwasa",
    ],
    priceRange: "$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
