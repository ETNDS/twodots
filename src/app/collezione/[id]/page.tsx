"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Animale } from "@/lib/animali";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import styles from "@styles/animaleDetail.module.css";

export default function AnimaleDetail() {
  const params = useParams();
  const router = useRouter();
  const [animale, setAnimale] = useState<Animale | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoAttiva, setFotoAttiva] = useState(0);

  useEffect(() => {
    async function carica() {
      const snap = await getDoc(doc(db, "animali", params.id as string));
      if (!snap.exists()) { router.push("/collezione"); return; }
      setAnimale({ id: snap.id, ...snap.data() } as Animale);
      setLoading(false);
    }
    carica();
  }, [params.id, router]);

  if (loading) return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main style={{ padding: "120px 36px", maxWidth: 800, margin: "0 auto" }}>
        <p style={{ fontSize: 13, opacity: 0.5 }}>Caricamento...</p>
      </main>
      <Footer />
    </>
  );

  if (!animale) return null;

  const fotoGalleria = animale.immaginiCiondolo?.filter(u => u) || [];

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>

        {/* BREADCRUMB */}
        <div className={styles.breadcrumb}>
          <Link href="/collezione" className={styles.breadcrumbLink}>Collezione</Link>
          <span className={styles.breadcrumbSep}>→</span>
          <span className={styles.breadcrumbCurrent}>{animale.nome}</span>
        </div>

        {/* HERO */}
        <div className={styles.hero}>
          <div className={styles.heroImmagini}>
            {/* Immagine principale — forma o disegno */}
            <div className={styles.imgPrincipale}>
              {(animale.immagineForma || animale.immagineDisegno) ? (
                <img
                  src={animale.immagineForma || animale.immagineDisegno}
                  alt={animale.nome}
                  className={styles.imgPrincipaleImg}
                />
              ) : (
                <div className={styles.imgPlaceholder}>
                  <span>{animale.nome[0]}</span>
                </div>
              )}
            </div>

            {/* Disegno animale (se c'è anche la forma) */}
            {animale.immagineForma && animale.immagineDisegno && (
              <div className={styles.imgDisegno}>
                <img src={animale.immagineDisegno} alt={`Disegno ${animale.nome}`} />
                <p className={styles.imgDisegnoLabel}>Disegno</p>
              </div>
            )}
          </div>

          <div className={styles.heroInfo}>
            <p className={styles.label}>COLLEZIONE</p>
            <h1 className={styles.nome}>{animale.nome}</h1>
            {animale.forma && <p className={styles.forma}>{animale.forma}</p>}

            <div className={styles.storia}>
              <ReactMarkdown>{animale.storia}</ReactMarkdown>
            </div>

            {/* DIMENSIONI */}
            {(animale.dimensioni?.v || animale.dimensioni?.h) && (
              <div className={styles.dimensioni}>
                {animale.dimensioni?.v && <span>{animale.dimensioni.v} cm × {animale.dimensioni?.h} cm</span>}
                {animale.occhiMm && <span>Occhi {animale.occhiMm} mm</span>}
              </div>
            )}

            {/* PREZZO */}
            <div className={styles.prezzoBox}>
              <span className={styles.prezzo}>€ {animale.prezzo || 45}</span>
              {animale.prezzoPet && (
                <span className={styles.prezzoPet}>+ € {animale.prezzoPet} con PET</span>
              )}
            </div>

            <Link href={`/configura?animale=${animale.id}`} className={styles.ctaBtn}>
              Configura questo ciondolo →
            </Link>
          </div>
        </div>

        {/* GALLERIA FOTO */}
        {fotoGalleria.length > 0 && (
          <div className={styles.galleria}>
            <h2 className={styles.galleriaTitle}>Il ciondolo realizzato</h2>
            <div className={styles.galleriaMain}>
              <img src={fotoGalleria[fotoAttiva]} alt={`${animale.nome} foto ${fotoAttiva + 1}`} className={styles.galleriaMainImg} />
            </div>
            {fotoGalleria.length > 1 && (
              <div className={styles.galleriaThumbs}>
                {fotoGalleria.map((url, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${fotoAttiva === i ? styles.thumbAttiva : ""}`}
                    onClick={() => setFotoAttiva(i)}
                  >
                    <img src={url} alt={`Foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LINK INSTAGRAM */}
        {animale.igLink && (
          <div className={styles.igBox}>
            <a href={animale.igLink} target="_blank" rel="noopener noreferrer" className={styles.igLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
              Vedi su Instagram
            </a>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
