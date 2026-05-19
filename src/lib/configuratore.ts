import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, orderBy, query } from "firebase/firestore";

export type ItemColore = {
  id: string;
  nome: string;
  descrizione: string;
  coloreCSS: string;
  immagini: string[];
  attivo: boolean;
  ordine: number;
};

export type FontDedica = {
  id: string;
  nome: string;
  descrizione: string;
  famiglia: string;
  tipo: "sans-serif" | "serif";
  sizePx: number;
  righe: number;
  caratteriPerRiga: number;
  attivo: boolean;
  ordine: number;
};

export type Confezione = {
  id: string;
  nome: string;
  descrizione: string;
  prezzo: number;
  immagini: string[];
  attivo: boolean;
  ordine: number;
};

export type Impostazioni = {
  prezzoBase: number;
  prezzoPet: number;
  prezzoDedica: number;
  prezzoDedicaPet: number;
  maxPezzi: number;
};

export type FasciaSconto = {
  id: string;
  da: number;
  percentuale: number;
  codiceShopify: string;
  attivo: boolean;
  ordine: number;
};

export type OcchioPos = {
  x: number;
  y: number;
  z: number;
};

export type PetCiondolo = {
  immagineForma: string;
  modello3D: string;
  occhioSxPos: OcchioPos | null;
  occhioDxPos: OcchioPos | null;
};

async function getCollezione<T>(nome: string): Promise<T[]> {
  const q = query(collection(db, nome), orderBy("ordine", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
}

export const getCristalli = () => getCollezione<ItemColore>("cristalli");
export const getCordini = () => getCollezione<ItemColore>("cordini");
export const getSmalti = () => getCollezione<ItemColore>("smalti");
export const getFontDedica = () => getCollezione<FontDedica>("fontDedica");
export const getConfezioni = () => getCollezione<Confezione>("confezioni");

export async function getImpostazioni(): Promise<Impostazioni> {
  const snap = await getDoc(doc(db, "configuratore", "impostazioni"));
  if (!snap.exists()) return { prezzoBase: 45, prezzoPet: 15, prezzoDedica: 0, prezzoDedicaPet: 0, maxPezzi: 5 };
  const d = snap.data();
  return {
    prezzoBase: d.prezzoBase || 45,
    prezzoPet: d.prezzoPet || 15,
    prezzoDedica: d.prezzoDedica || 0,
    prezzoDedicaPet: d.prezzoDedicaPet || 0,
    maxPezzi: d.maxPezzi || 5,
  };
}

export async function getPetCiondolo(): Promise<PetCiondolo | null> {
  const snap = await getDoc(doc(db, "configuratore", "pet"));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    immagineForma: d.immagineForma || "",
    modello3D: d.modello3D || "",
    occhioSxPos: d.occhioSxPos || null,
    occhioDxPos: d.occhioDxPos || null,
  };
}

export async function savePetCiondolo(data: PetCiondolo): Promise<void> {
  await setDoc(doc(db, "configuratore", "pet"), data);
}

export async function getFasceSconto(): Promise<FasciaSconto[]> {
  const q = query(collection(db, "fasceSconto"), orderBy("ordine", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as FasciaSconto);
}

export async function saveFasciaSconto(id: string | null, data: Omit<FasciaSconto, "id">): Promise<void> {
  const ref = id ? doc(db, "fasceSconto", id) : doc(collection(db, "fasceSconto"));
  await setDoc(ref, data);
}

export async function deleteFasciaSconto(id: string): Promise<void> {
  await deleteDoc(doc(db, "fasceSconto", id));
}

export function calcolaSconto(fasce: FasciaSconto[], totalePezzi: number): FasciaSconto | null {
  const attive = fasce.filter(f => f.attivo && f.da <= totalePezzi);
  if (attive.length === 0) return null;
  return attive.reduce((best, f) => f.da > best.da ? f : best);
}

export type PetSize = {
  id: string;
  etichetta: string;  // testo mostrato all'utente, es. "Piccolo (fino a 5kg)"
  slug: string;       // chiave interna, es. "piccolo"
  ordine: number;
  attivo: boolean;
};

export async function getPetSizes(): Promise<PetSize[]> {
  const q = query(collection(db, "petSizes"), orderBy("ordine", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as PetSize);
}

export async function savePetSize(id: string | null, data: Omit<PetSize, "id">): Promise<void> {
  const ref = id ? doc(db, "petSizes", id) : doc(collection(db, "petSizes"));
  await setDoc(ref, data);
}

export async function deletePetSize(id: string): Promise<void> {
  await deleteDoc(doc(db, "petSizes", id));
}
