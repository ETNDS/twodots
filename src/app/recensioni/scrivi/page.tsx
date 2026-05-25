"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { aggiungiRecensione } from "@/lib/recensioni";
import styles from "@styles/recensioni.module.css";

const MAX_SIZE_MB = 5;

export default function ScriviRecensione() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [inviato, setInviato] = useState(false);
  const [errore, setErrore] = useState("");
  const [immagineFile, setImmagineFile] = useState<File | null>(null);
  const [immaginePreview, setImmaginePreview] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", stelle: 5, commento: "" });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrore(`L'immagine non può superare ${MAX_SIZE_MB}MB.`);
      return;
    }
    setErrore("");
    setImmagineFile(file);
    setImmaginePreview(URL.createObjectURL(file));
  }

  function rimuoviImmagine() {
    setImmagineFile(null);
    setImmaginePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit() {
    if (!form.nome.trim() || !form.commento.trim()) {
      setErrore("Nome e commento sono obbligatori.");
      return;
    }
    setErrore("");
    await aggiungiRecensione({ ...form, immagineFile });
    setInviato(true);
  }

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.titolo}>Scrivi una recensione</h1>

        {inviato ? (
          <div className={styles.formBox}>
            <p className={styles.successo}>Grazie! La tua recensione è in attesa di approvazione.</p>
            <button className={styles.scriviBtn} style={{ marginTop: 16 }} onClick={() => router.push("/recensioni")}>
              Leggi le recensioni
            </button>
          </div>
        ) : (
          <div className={styles.formBox}>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nome *</label>
                <input className={styles.input} value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email (non verrà mostrata)</label>
                <input className={styles.input} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Valutazione</label>
                <div className={styles.stelleInput}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} className={i <= form.stelle ? styles.stellaPiena : styles.stellaVuota}
                      onClick={() => setForm(p => ({ ...p, stelle: i }))}>★</button>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Commento *</label>
                <textarea className={styles.textarea} rows={4} value={form.commento}
                  onChange={e => setForm(p => ({ ...p, commento: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Foto (opzionale, max {MAX_SIZE_MB}MB)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFile}
                />
                {!immaginePreview ? (
                  <button
                    type="button"
                    className={styles.fileBtn}
                    onClick={() => fileRef.current?.click()}
                  >
                    + Aggiungi una foto
                  </button>
                ) : (
                  <div className={styles.previewBox}>
                    <img src={immaginePreview} alt="Anteprima" className={styles.previewImg} />
                    <button type="button" className={styles.rimuoviBtn} onClick={rimuoviImmagine}>Rimuovi</button>
                  </div>
                )}
              </div>
              {errore && <p className={styles.errore}>{errore}</p>}
              <button className={styles.submitBtn} onClick={handleSubmit}>Invia recensione</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
