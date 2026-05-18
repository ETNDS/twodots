import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase-admin";
import { Animale } from "@/lib/animali";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import AnimaleDetailClient from "@/components/AnimaleDetailClient";
import { SITE } from "@/config/constants";
import Script from "next/script";

type Props = { params: Promise<{ id: string }> };

async function getAnimale(id: string): Promise<Animale | null> {
  try {
    const snap = await adminDb.collection("animali").doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    // Converti Timestamp in stringhe per serializzazione
    return {
      ...data,
      id: snap.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
    } as unknown as Animale;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const animale = await getAnimale(id);
  if (!animale) return {};
  return {
    title: `Ciondolo ${animale.nome} — bijoux artigianale`,
    description: `Ciondolo ${animale.nome} in ceramica stampata in 3D con cristalli Swarovski. ${animale.forma}. Personalizzabile con dedica incisa. A partire da € ${animale.prezzo || 45}.`,
    openGraph: {
      title: `Ciondolo ${animale.nome} — Two Dots`,
      description: `${animale.forma}. Ceramica 3D con cristalli Swarovski. Personalizzabile.`,
      url: `${SITE.url}/collezione/${animale.id}`,
      images: animale.immagineForma
        ? [{ url: animale.immagineForma, width: 800, height: 800, alt: `Ciondolo ${animale.nome}` }]
        : [],
    },
  };
}

export default async function AnimaleDetail({ params }: Props) {
  const { id } = await params;
  const animale = await getAnimale(id);
  if (!animale) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Ciondolo ${animale.nome} — Two Dots`,
    description: `Ciondolo ${animale.nome} in ceramica stampata in 3D con cristalli Swarovski. ${animale.forma}. Personalizzabile con dedica incisa.`,
    image: animale.immagineForma || animale.immagineDisegno || "",
    brand: { "@type": "Brand", name: "Two Dots" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: animale.prezzo || 45,
      offerCount: 1,
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/collezione/${animale.id}`,
    },
  };

  return (
    <>
      <Script
        id="jsonld-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="beforeInteractive"
      />
      <BackgroundLogo />
      <Navbar />
      <AnimaleDetailClient animale={animale} />
      <Footer />
    </>
  );
}
