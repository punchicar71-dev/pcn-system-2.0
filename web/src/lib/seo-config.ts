// SEO Configuration for Punchi Car Niwasa Website
// Centralized SEO metadata and constants

export const siteConfig = {
  name: "Punchi Car Niwasa",
  nameEn: "Punchi Car Niwasa - Vehicle Park Malabe",
  nameSi: "පුංචි කාර් නිවස - මාලඹේ වාහන උද්‍යානය",
  url: "https://www.punchicar.lk",
  description: "Sri Lanka's largest vehicle park with 400+ quality used cars. Buy & sell vehicles at Malabe Vehicle Park. Japanese imported cars with comprehensive inspection.",
  descriptionSi: "ලංකාවේ සුවිශාලතම වාහන උද්‍යානය. තෝරා ගැනිමට වාහන 400ක් එකම උද්‍යානයක.",
  keywords: [
    "used cars Sri Lanka",
    "vehicles for sale Malabe",
    "Japanese imported cars",
    "car dealer Sri Lanka",
    "vehicle park Malabe",
    "buy cars Sri Lanka",
    "sell cars Sri Lanka",
    "Punchi Car Niwasa",
    "පුංචි කාර් නිවස",
    "වාහන විකිණීමට",
    "ජපන් වාහන",
    "මාලඹේ වාහන",
    "used car dealer",
    "quality used vehicles",
    "car showroom Colombo",
    "auto sales Sri Lanka",
    "second hand cars",
    "pre-owned vehicles",
    "car financing Sri Lanka",
    "vehicle inspection",
  ],
  author: "Punchi Car Niwasa",
  locale: "en_LK",
  alternateLocale: "si_LK",
  phone: {
    primary: "+94 112 413 865",
    secondary: "+94 112 413 866",
  },
  email: {
    sales: "sales@punchicar.lk",
    support: "support@punchicar.lk",
  },
  address: {
    street: "Vehicle Park",
    city: "Malabe",
    country: "Sri Lanka",
    postalCode: "10115",
  },
  socialLinks: {
    facebook: "https://www.facebook.com/punchicar",
    instagram: "https://www.instagram.com/punchicar",
    youtube: "https://www.youtube.com/@punchicarniwasa",
    whatsapp: "https://wa.me/94112413865",
  },
  businessHours: {
    open: "09:00",
    close: "18:00",
    days: "Monday - Sunday",
    timezone: "Asia/Colombo",
  },
  images: {
    logo: "/logo_icon.png",
    ogImage: "/og-image.jpg",
    favicon: "/logo_icon.png",
  },
};

// Page-specific SEO metadata
export const pagesSeo = {
  home: {
    title: "Buy Quality Used Cars | Punchi Car Niwasa - Vehicle Park Malabe",
    description: "Explore 400+ quality used vehicles at Sri Lanka's largest vehicle park. Japanese imported cars with inspection. Visit Punchi Car Niwasa, Malabe today!",
    keywords: "used cars Sri Lanka, buy cars Malabe, Japanese imported vehicles, car showroom, vehicle park",
    canonicalPath: "/vehicles",
  },
  vehicles: {
    title: "400+ Quality Used Vehicles for Sale | Punchi Car Niwasa Malabe",
    description: "Browse our collection of 400+ quality used cars. Toyota, Honda, Nissan, Suzuki & more. All vehicles inspected. Best prices in Sri Lanka. Visit our Malabe showroom.",
    keywords: "used cars for sale, Toyota, Honda, Nissan, Suzuki, Japanese cars, vehicle listings, car prices Sri Lanka",
    canonicalPath: "/vehicles",
  },
  about: {
    title: "About Us - Sri Lanka's Largest Vehicle Park | Punchi Car Niwasa",
    description: "Learn about Punchi Car Niwasa - Sri Lanka's largest vehicle collection with 400+ cars in one place. Transparent pricing, quality inspection, trusted since establishment.",
    keywords: "about punchi car niwasa, vehicle park history, trusted car dealer Sri Lanka, transparent car sales",
    canonicalPath: "/about",
  },
  services: {
    title: "Our Services - Buy, Sell & Trade Vehicles | Punchi Car Niwasa",
    description: "Buy or sell your vehicle at Punchi Car Niwasa. Services include vehicle inspection, documentation verification, financing assistance, and transparent transactions.",
    keywords: "buy vehicles, sell cars, car inspection, vehicle documentation, car financing Sri Lanka, trade-in",
    canonicalPath: "/services",
  },
  contact: {
    title: "Contact Us - Visit Our Malabe Showroom | Punchi Car Niwasa",
    description: "Contact Punchi Car Niwasa for quality used vehicles. Visit our Malabe showroom, call +94 112 413 865, or email sales@punchicar.lk. Open daily 9AM-6PM.",
    keywords: "contact car dealer, Malabe showroom location, car dealer phone number, visit vehicle park",
    canonicalPath: "/contact",
  },
};

// Structured Data Templates
export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.nameSi,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.images.logo}`,
    image: `${siteConfig.url}${siteConfig.images.ogImage}`,
    description: siteConfig.description,
    telephone: siteConfig.phone.primary,
    email: siteConfig.email.sales,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: "LK",
      postalCode: siteConfig.address.postalCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "6.9147",
      longitude: "79.9710",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: siteConfig.businessHours.open,
      closes: siteConfig.businessHours.close,
    },
    sameAs: [
      siteConfig.socialLinks.facebook,
      siteConfig.socialLinks.instagram,
      siteConfig.socialLinks.youtube,
    ],
    priceRange: "$$",
    currenciesAccepted: "LKR",
    paymentAccepted: "Cash, Bank Transfer, Leasing",
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
  },
  
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/vehicles?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en", "si"],
  },

  breadcrumbList: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  }),

  vehicleList: {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Available Vehicles at Punchi Car Niwasa",
    description: "Browse our collection of quality used vehicles",
    numberOfItems: 400,
    itemListElement: [], // Populated dynamically
  },

  faqPage: (faqs: { question: string; answer: string }[]) => ({
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
  }),

  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    image: `${siteConfig.url}${siteConfig.images.ogImage}`,
    telephone: siteConfig.phone.primary,
    email: siteConfig.email.sales,
    url: siteConfig.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: "LK",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: siteConfig.businessHours.open,
      closes: siteConfig.businessHours.close,
    },
  },
};

// FAQ Content for structured data
export const faqContent = [
  {
    question: "How many vehicles are available at Punchi Car Niwasa?",
    answer: "We have over 400 quality used vehicles available at our Malabe vehicle park. Our collection includes various brands like Toyota, Honda, Nissan, Suzuki, and more.",
  },
  {
    question: "What are your business hours?",
    answer: "We are open every day from 9:00 AM to 6:00 PM. Visit us at our Malabe Vehicle Park location.",
  },
  {
    question: "Do you provide vehicle inspection services?",
    answer: "Yes, all our vehicles go through comprehensive inspection before being displayed. We also assist buyers with document verification using technical equipment.",
  },
  {
    question: "Can I sell my vehicle at Punchi Car Niwasa?",
    answer: "Yes, we accept vehicles for sale. Our transparent process ensures fair pricing for both buyers and sellers. Contact us for more details.",
  },
  {
    question: "Do you offer financing options?",
    answer: "Yes, we work with various leasing companies to provide financing options for vehicle purchases. Our team can assist you with the application process.",
  },
  {
    question: "Are Japanese imported vehicles available?",
    answer: "Yes, we have a large collection of quality Japanese imported vehicles including Toyota, Honda, Nissan, Suzuki, and other popular brands.",
  },
  {
    question: "How can I contact Punchi Car Niwasa?",
    answer: "You can reach us at +94 112 413 865 or email sales@punchicar.lk. You can also visit our Vehicle Park in Malabe, open daily from 9AM to 6PM.",
  },
  {
    question: "Is the pricing transparent at Punchi Car Niwasa?",
    answer: "Yes, all transactions are conducted transparently via speaker phone. Buyers can hear the conversation directly. After receiving advance payment, an automatic SMS is sent to the vehicle owner confirming the price.",
  },
];

// Generate vehicle structured data
export const generateVehicleSchema = (vehicle: {
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  image: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Car",
  name: vehicle.name,
  brand: {
    "@type": "Brand",
    name: vehicle.brand,
  },
  model: vehicle.model,
  vehicleModelDate: vehicle.year.toString(),
  mileageFromOdometer: {
    "@type": "QuantitativeValue",
    value: vehicle.mileage,
    unitCode: "KMT",
  },
  fuelType: vehicle.fuelType,
  vehicleTransmission: vehicle.transmission,
  image: vehicle.image,
  url: `${siteConfig.url}${vehicle.url}`,
  offers: {
    "@type": "Offer",
    price: vehicle.price,
    priceCurrency: "LKR",
    availability: "https://schema.org/InStock",
    seller: {
      "@id": `${siteConfig.url}/#organization`,
    },
  },
});
