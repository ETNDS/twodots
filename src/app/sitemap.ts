import { MetadataRoute } from "next";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BASE = "https://www.twodotsmilano.it";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/home`, lastModified: new Date(), priority: 1.0 },
    { url: `${BASE}/collezione`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE}/configura`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE}/bijoux-coppia`, lastModified: new Date(), priority: 0.7 },
    { url: `${BASE}/storia`, lastModified: new Date(), priority: 0.6 },
    { url: `${BASE}/contatti`, lastModified: new Date(), priority: 0.5 },
    { url: `${BASE}/recensioni`, lastModified: new Date(), priority: 0.4 },
  ];

  try {
    const q = query(collection(db, "animali"), where("pubblicato", "==", true));
    const snap = await getDocs(q);
    const animali: MetadataRoute.Sitemap = snap.docs.map(d => ({
      url: `${BASE}/collezione/${d.id}`,
      lastModified: new Date(),
      priority: 0.8,
    }));
    return [...staticPages, ...animali];
  } catch {
    return staticPages;
  }
}
