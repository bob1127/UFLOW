/**
 * UFLOW 商家 / GEO SEO 共用常數與 JSON-LD 建立器
 * Google 可用：Organization、LocalBusiness、OnlineStore、PostalAddress、geo 相關欄位
 */

export const BUSINESS = {
  legalName: "慶安有福有限公司",
  brandName: "UFLOW",
  displayName: "UFLOW 慶安有福",
  taxID: "60781383",
  telephone: "+886-978-138-979",
  email: "uflowspace@gmail.com",
  priceRange: "$$",
  currenciesAccepted: "TWD",
  paymentAccepted: "Credit Card, LINE Pay, ATM, Convenience Store Payment",
  // 桃園市桃園區永興里三民路三段28之1號3樓之1
  address: {
    streetAddress: "永興里三民路三段28之1號3樓之1",
    addressLocality: "桃園區",
    addressRegion: "桃園市",
    postalCode: "330",
    addressCountry: "TW",
  },
  fullAddress: "桃園市桃園區永興里三民路三段28之1號3樓之1",
  // 桃園區三民路三段一帶約略座標（供 LocalBusiness GEO 使用）
  geo: {
    latitude: 25.0007,
    longitude: 121.3064,
  },
  openingHours: [
    {
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: [
    "https://line.me/R/ti/p/@uflow",
  ],
  freeShippingThreshold: 2000,
  defaultShippingFee: 80,
};

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  // 正式網域備援：避免在忘記設定環境變數時，結構化資料誤植 localhost
  return "https://www.uflow.space";
}

export function getPostalAddress() {
  return {
    "@type": "PostalAddress",
    ...BUSINESS.address,
  };
}

export function getGeoCoordinates() {
  return {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.geo.latitude,
    longitude: BUSINESS.geo.longitude,
  };
}

export function getMapsUrl() {
  const q = encodeURIComponent(BUSINESS.fullAddress);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** 完整商家實體 — Google Local / GEO / 商家資訊 */
export function buildOrganizationSchema(siteUrl = getSiteUrl()) {
  const logoUrl = `${siteUrl}/images/logo/uflow.png`;
  const imageUrl = `${siteUrl}/images/logo/uflow.png`;

  return {
    "@context": "https://schema.org",
    "@type": [
      "Organization",
      "LocalBusiness",
      "Store",
      "OnlineStore",
      "HealthAndBeautyBusiness",
    ],
    "@id": `${siteUrl}/#organization`,
    name: BUSINESS.displayName,
    legalName: BUSINESS.legalName,
    alternateName: [BUSINESS.brandName, "UFLOW 功能性保健食品", "慶安有福"],
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteUrl}/#logo`,
      url: logoUrl,
      contentUrl: logoUrl,
      caption: BUSINESS.displayName,
    },
    image: [imageUrl, `${siteUrl}/images/logo-04.png`],
    description:
      "UFLOW 慶安有福專注於功能性保健食品與日常營養補給。堅持科學調配、足量攝取，嚴選國際大廠專利原料，全系列通過第三方檢驗。",
    slogan: "Enjoy Healthy Life!",
    taxID: BUSINESS.taxID,
    vatID: BUSINESS.taxID,
    foundingDate: "2020",
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: BUSINESS.currenciesAccepted,
    paymentAccepted: BUSINESS.paymentAccepted,
    address: getPostalAddress(),
    geo: getGeoCoordinates(),
    hasMap: getMapsUrl(),
    areaServed: [
      {
        "@type": "Country",
        name: "Taiwan",
      },
      {
        "@type": "AdministrativeArea",
        name: "桃園市",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BUSINESS.telephone,
        contactType: "customer service",
        email: BUSINESS.email,
        areaServed: "TW",
        availableLanguage: ["zh-TW", "en"],
      },
      {
        "@type": "ContactPoint",
        telephone: BUSINESS.telephone,
        contactType: "sales",
        email: BUSINESS.email,
        areaServed: "TW",
        availableLanguage: ["zh-TW"],
      },
    ],
    openingHoursSpecification: BUSINESS.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: BUSINESS.sameAs,
    brand: {
      "@type": "Brand",
      name: BUSINESS.brandName,
      logo: logoUrl,
    },
    identifier: [
      {
        "@type": "PropertyValue",
        name: "統一編號",
        propertyID: "VAT ID",
        value: BUSINESS.taxID,
      },
    ],
    knowsAbout: [
      "功能性保健食品",
      "肽晶芙蓉",
      "GABA 鎂鎂香蜂草",
      "維他菌合生元",
      "第三方檢驗",
      "營養補給",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "UFLOW 產品目錄與運送政策",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "熱銷保健食品",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "肽晶芙蓉",
                url: `${siteUrl}/products/肽晶芙蓉`,
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "GABA 鎂鎂香蜂草",
                url: `${siteUrl}/products/gaba鎂鎂香蜂草`,
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "維他菌合生元",
                url: `${siteUrl}/products/synbiotics`,
              },
            },
          ],
        },
      ],
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "TW",
      },
      shippingRate: {
        "@type": "MonetaryAmount",
        value: String(BUSINESS.defaultShippingFee),
        currency: "TWD",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 3,
          unitCode: "d",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 3,
          unitCode: "d",
        },
      },
    },
  };
}

export function buildWebSiteSchema(siteUrl = getSiteUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: BUSINESS.brandName,
    alternateName: BUSINESS.displayName,
    description: "功能性保健食品與營養補給｜專為亞洲體質研發・安心第三方檢驗",
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "zh-TW",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildWebPageSchema({
  siteUrl = getSiteUrl(),
  type = "WebPage",
  idPath = "/#webpage",
  url,
  name,
  description,
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${siteUrl}${idPath}`,
    url: url || siteUrl,
    name,
    description,
    inLanguage: "zh-TW",
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${siteUrl}/images/logo/uflow.png`,
    },
  };
}

export function buildBreadcrumbSchema(items, siteUrl = getSiteUrl(), idPath) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${siteUrl}${idPath}`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(faqs, siteUrl = getSiteUrl(), idPath = "/#faq") {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}${idPath}`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildPlaceSchema(siteUrl = getSiteUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${siteUrl}/#place`,
    name: `${BUSINESS.displayName} 營業所`,
    address: getPostalAddress(),
    geo: getGeoCoordinates(),
    hasMap: getMapsUrl(),
    telephone: BUSINESS.telephone,
  };
}
