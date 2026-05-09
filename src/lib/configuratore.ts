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
  if (!snap.exists()) return { prezzoBase: 45, prezzoPet: 15, prezzoDedica: 0, prezzoDedicaPet: 0 };
  const d = snap.data();
  return {
    prezzoBase: d.prezzoBase || 45,
    prezzoPet: d.prezzoPet || 15,
    prezzoDedica: d.prezzoDedica || 0,
    prezzoDedicaPet: d.prezzoDedicaPet || 0,
  };
}