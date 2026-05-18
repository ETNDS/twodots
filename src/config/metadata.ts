import type { Metadata } from "next";
import { SITE } from "@/config/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Two Dots — Bijoux artigianali con animali stilizzati e cristalli Swarovski",
    template: "Two Dots | %s",
  },
  description:
    "Bijoux artigianali in ceramica stampata in 3D con cristalli Swarovski. Ciondoli con animali stilizzati personalizzabili con dedica incisa. Prodotti a Milano su richiesta.",
  keywords: [
    "bijoux artigianale",
    "ciondolo animale personalizzato",
    "bijoux ceramica 3D",
    "cristalli Swarovski",
    "ciondolo gatto",
    "ciondolo cane",
    "gioiello con animale",
    "collana animale stilizzato",
    "bijoux stampa 3D",
    "regalo amante animali",
    "bijoux personalizzato Milano",
    "ciondolo con dedica incisa",
    "Two Dots",
    "twodotsmilano",
  ],
  openGraph: {
    title: "Two Dots — Bijoux artigianali con animali stilizzati",
    description:
      "Ciondoli in ceramica stampata in 3D con cristalli Swarovski. Ogni animale è stilizzato, ogni pezzo è personalizzabile con dedica incisa. Prodotto a Milano su richiesta.",
    url: SITE.url,
    siteName: SITE.name,
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: "Two Dots — Bijoux artigianali con animali stilizzati e cristalli Swarovski",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Two Dots — Bijoux artigianali con animali stilizzati",
    description:
      "Ciondoli in ceramica 3D con cristalli Swarovski. Personalizzabili con dedica. Prodotti a Milano su richiesta.",
    images: [SITE.ogImage],
  },
  alternates: {
    canonical: SITE.url,
  },
};
