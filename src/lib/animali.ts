import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export type Animale = {
  id: string;
  nome: string;
  storia: string;
  forma: string;
  dimensioni: { v: number; h: number };
  occhiMm: number;
  immagineDisegno: string;
  immagineForma: string;
  immaginiCiondolo: string[];
  modello3D?: string;
  pubblicato: boolean;
  ordine: number;
  igLink: string;
  prezzo: number;
  prezzoPet: number;
  inEvidenza?: boolean;
  defaultViewer?: {
    coloreCiondolo: string;
    coloreDisegno: string;
  };
};

export async function getAnimaliPubblicati(): Promise<Animale[]> {
  const snapshot = await getDocs(collection(db, "animali"));
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Animale)
    .filter((a) => a.pubblicato)
    .sort((a, b) => a.ordine - b.ordine);
}

export async function getTuttiAnimali(): Promise<Animale[]> {
  const snapshot = await getDocs(collection(db, "animali"));
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Animale)
    .sort((a, b) => a.nome.localeCompare(b.nome));
}
