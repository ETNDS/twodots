import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.twodotsdesign.it"),
  title: "Two Dots — Bijoux in ceramica stampata in 3D",
  description:
    "Bijoux artigianali in ceramica stampata in 3D con cristalli Swarovski. Ogni ciondolo porta il disegno stilizzato di un animale. Unico, perché lo configuri tu.",
  keywords: [
    "bijoux",
    "ceramica",
    "stampa 3D",
    "Swarovski",
    "ciondolo",
    "animali",
    "artigianale",
    "Milano",
    "Two Dots",
  ],
  openGraph: {
    title: "Two Dots — Bijoux in ceramica stampata in 3D",
    description:
      "Bijoux artigianali in ceramica stampata in 3D con cristalli Swarovski. Ogni ciondolo porta il disegno stilizzato di un animale.",
    url: "https://www.twodotsdesign.it",
    siteName: "Two Dots",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "https://www.twodotsdesign.it/images/twodots-og.jpg",
        width: 1200,
        height: 630,
        alt: "Two Dots — Bijoux in ceramica stampata in 3D",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Two Dots — Bijoux in ceramica stampata in 3D",
    description:
      "Bijoux artigianali in ceramica stampata in 3D con cristalli Swarovski.",
    images: ["https://www.twodotsdesign.it/images/twodots-og.jpg"],
  },
};
