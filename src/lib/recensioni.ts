import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type StatoRecensione = "bozza" | "approvata" | "rifiutata";

export type Recensione = {
  id: string;
  nome: string;
  email: string;
  stelle: number;
  commento: string;
  stato: StatoRecensione;
  createdAt: Date | null;
  immagineUrl?: string;
};

export async function getTutteRecensioni(): Promise<Recensione[]> {
  const q = query(collection(db, "recensioni"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      nome: data.nome || "",
      email: data.email || "",
      stelle: data.stelle || 1,
      commento: data.commento || "",
      stato: data.stato || "bozza",
      createdAt: data.createdAt?.toDate() || null,
      immagineUrl: data.immagineUrl || undefined,
    };
  });
}

export async function getRecensioniApprovate(): Promise<Recensione[]> {
  const tutte = await getTutteRecensioni();
  return tutte.filter(r => r.stato === "approvata");
}

export async function aggiungiRecensione(dati: {
  nome: string;
  email: string;
  stelle: number;
  commento: string;
  immagineFile?: File | null;
}): Promise<void> {
  let immagineUrl: string | undefined;

  if (dati.immagineFile) {
    const storageRef = ref(storage, `recensioni/${Date.now()}_${dati.immagineFile.name}`);
    await uploadBytes(storageRef, dati.immagineFile);
    immagineUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "recensioni"), {
    nome: dati.nome,
    email: dati.email,
    stelle: dati.stelle,
    commento: dati.commento,
    stato: "bozza",
    createdAt: serverTimestamp(),
    ...(immagineUrl ? { immagineUrl } : {}),
  });
}

export async function aggiornaStatoRecensione(id: string, stato: StatoRecensione): Promise<void> {
  await updateDoc(doc(db, "recensioni", id), { stato });
}
