import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, orderBy, query } from "firebase/firestore";

export type FaqCategoria = {
  id: string;
  nome: string;
  slug: string;
  ordine: number;
  attivo: boolean;
};

export type Faq = {
  id: string;
  domanda: string;
  risposta: string;
  categoriaSlug: string;
  ordine: number;
  attivo: boolean;
};

export async function getFaqCategorie(): Promise<FaqCategoria[]> {
  const q = query(collection(db, "faqCategorie"), orderBy("ordine", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as FaqCategoria);
}

export async function getFaq(): Promise<Faq[]> {
  const q = query(collection(db, "faq"), orderBy("ordine", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Faq);
}

export async function saveFaqCategoria(id: string | null, data: Omit<FaqCategoria, "id">): Promise<void> {
  const ref = id ? doc(db, "faqCategorie", id) : doc(collection(db, "faqCategorie"));
  await setDoc(ref, data);
}

export async function deleteFaqCategoria(id: string): Promise<void> {
  await deleteDoc(doc(db, "faqCategorie", id));
}

export async function saveFaq(id: string | null, data: Omit<Faq, "id">): Promise<void> {
  const ref = id ? doc(db, "faq", id) : doc(collection(db, "faq"));
  await setDoc(ref, data);
}

export async function deleteFaq(id: string): Promise<void> {
  await deleteDoc(doc(db, "faq", id));
}
