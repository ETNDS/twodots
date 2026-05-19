"use client";

import type { Metadata } from "next";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getFaq, getFaqCategorie, Faq, FaqCategoria } from "@/lib/faq";
import { CONTACT } from "@/config/constants";
import styles from "@styles/faq.module.css";

export default function FaqPage() {
  const [categorie, setCategorie] = useState<FaqCategoria[]>([]);
  const [faq, setFaq] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [aperta, setAperta] = useState<string | null>(null);

  useEffect(() => {
    async function carica() {
      const [cats, faqs] = await Promise.all([getFaqCategorie(), getFaq()]);
      setCategorie(cats.filter(c => c.attivo));
      setFaq(faqs.filter(f => f.attivo));
      setLoading(false);
    }
    carica();
  }, []);

  function toggle(id: string) {
    setAperta(prev => prev === id ? null : id);
  }

  if (loading) return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <p className={styles.loading}>Caricamento...</p>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.label}>FAQ</p>
          <h1 className={styles.titolo}>Domande frequenti</h1>
          <p className={styles.sub}>
            Tutto quello che devi sapere prima di configurare il tuo bijoux.
          </p>
        </div>

        <div className={styles.content}>
          {categorie.map(cat => {
            const domande = faq.filter(f => f.categoriaSlug === cat.slug);
            if (domande.length === 0) return null;
            return (
              <div key={cat.id} className={styles.gruppo}>
                <h2 className={styles.gruppoTitolo}>{cat.nome}</h2>
                <div className={styles.lista}>
                  {domande.map(f => (
                    <div key={f.id} className={styles.item}>
                      <button
                        className={`${styles.domanda} ${aperta === f.id ? styles.domandaAperta : ""}`}
                        onClick={() => toggle(f.id)}
                      >
                        <span>{f.domanda}</span>
                        <span className={styles.icona}>{aperta === f.id ? "−" : "+"}</span>
                      </button>
                      {aperta === f.id && (
                        <div className={styles.risposta}>
                          <p>{f.risposta}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.contatti}>
          <p className={styles.contattiTesto}>
            Hai altre domande?{" "}
            <a href={`mailto:${CONTACT.email}`} className={styles.contattiLink}>
              Scrivici a {CONTACT.email}
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
