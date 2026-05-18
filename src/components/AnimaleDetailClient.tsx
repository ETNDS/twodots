"use client";

import { useState } from "react";
import { Animale } from "@/lib/animali";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import styles from "@styles/animaleDetail.module.css";

export default function AnimaleDetailClient({ animale }: { animale: Animale }) {
  const [fotoAttiva, setFotoAttiva] = useState(0);
  const fotoGalleria = animale.immaginiCiondolo?.filter(u => u) || [];

  return (
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
          <div className={styles.imgPrincipale}>
            {(animale.immagineForma || animale.immagineDisegno) ? (
              <img
                src={animale.immagineForma || animale.immagineDisegno}
                alt={`Ciondolo ${animale.nome} — bijoux artigianale Two Dots in ceramica 3D con cristalli Swarovski`}
                className={styles.imgPrincipaleImg}
              />
            ) : (
              <div className={styles.imgPlaceholder}>
                <span>{animale.nome[0]}</span>
              </div>
            )}
          </div>

          {animale.immagineForma && animale.immagineDisegno && (
            <div className={styles.imgDisegno}>
              <img src={animale.immagineDisegno} alt={`Disegno stilizzato ${animale.nome} — Two Dots`} />
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

          {(animale.dimensioni?.v || animale.dimensioni?.h) && (
            <div className={styles.dimensioni}>
              {animale.dimensioni?.v && <span>{animale.dimensioni.v} cm × {animale.dimensioni?.h} cm</span>}
              {animale.occhiMm && <span>Occhi {animale.occhiMm} mm</span>}
            </div>
          )}

          <div className={styles.prezzoBox}>
            <span className={styles.prezzo}>A partire da € {animale.prezzo || 45}</span>
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
            <img
              src={fotoGalleria[fotoAttiva]}
              alt={`${animale.nome} — foto prodotto Two Dots ${fotoAttiva + 1}`}
              className={styles.galleriaMainImg}
            />
          </div>
          {fotoGalleria.length > 1 && (
            <div className={styles.galleriaThumbs}>
              {fotoGalleria.map((url, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${fotoAttiva === i ? styles.thumbAttiva : ""}`}
                  onClick={() => setFotoAttiva(i)}
                >
                  <img src={url} alt={`${animale.nome} foto ${i + 1}`} />
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
  );
}
