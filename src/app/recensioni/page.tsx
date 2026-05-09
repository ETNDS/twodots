"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getRecensioniApprovate, aggiungiRecensione, Recensione } from "@/lib/recensioni";
import styles from "@styles/recensioni.module.css";

function Stelle({ n }: { n: number }) {
  return (
    <span className={styles.stelle}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= n ? styles.stellaPiena : styles.stellaVuota}>★</span>
      ))}
    </span>
  );
}

export default function Recensioni() {
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviato, setInviato] = useState(false);
  const [errore, setErrore] = useState("");
  const [form, setForm] = useState({ nome: "", email: "", stelle: 5, commento: "" });

  useEffect(() => {
    getRecensioniApprovate().then(r => { setRecensioni(r); setLoading(false); });
  }, []);

  async function handleSubmit() {
    if (!form.nome.trim() || !form.commento.trim()) {
      setErrore("Nome e commento sono obbligatori.");
      return;
    }
    setErrore("");
    await aggiungiRecensione(form);
    setInviato(true);
    setForm({ nome: "", email: "", stelle: 5, commento: "" });
  }

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.titolo}>Recensioni</h1>

        <div className={styles.formBox}>
          <h2 className={styles.formTitolo}>Lascia una recensione</h2>
          {inviato ? (
            <p className={styles.successo}>Grazie! La tua recensione è in attesa di approvazione.</p>
          ) : (
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
              {errore && <p className={styles.errore}>{errore}</p>}
              <button className={styles.submitBtn} onClick={handleSubmit}>Invia recensione</button>
            </div>
          )}
        </div>

        <div className={styles.lista}>
          <h2 className={styles.listaTitolo}>Cosa dicono di noi</h2>
          {loading ? (
            <p className={styles.loading}>Caricamento...</p>
          ) : recensioni.length === 0 ? (
            <p className={styles.vuoto}>Ancora nessuna recensione.</p>
          ) : (
            recensioni.map(r => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardNome}>{r.nome}</span>
                  <Stelle n={r.stelle} />
                </div>
                <p className={styles.cardCommento}>{r.commento}</p>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
