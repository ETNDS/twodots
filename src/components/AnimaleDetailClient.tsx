"use client";

import { useState } from "react";
import { Animale } from "@/lib/animali";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import dynamic from "next/dynamic";
import IconInstagram from "@/components/IconInstagram";
import styles from "@styles/animaleDetail.module.css";

const Viewer3D = dynamic(() => import("@/components/Viewer3D"), { ssr: false });

// Colori default per il viewer nella pagina di dettaglio
// Valori default viewer — sovrascrivibili per animale tramite defaultViewer nel db
const VIEWER_FALLBACK = {
  coloreCiondolo: "nero" as const,
  coloreDisegno: "#ffffff",
  coloreOcchioSx: "#ccddff",
  coloreOcchioDx: "#ccddff",
};

export default function AnimaleDetailClient({ animale }: { animale: Animale }) {
  const [fotoAttiva, setFotoAttiva] = useState(0);
  const fotoGalleria = animale.immaginiCiondolo?.filter(u => u) || [];
  const has3D = !!animale.modello3D;

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

          {/* VIEWER 3D */}
          {has3D && (
            <div className={styles.viewer3DWrapper}>
              <Viewer3D
                glbUrl={animale.modello3D!}
                coloreCiondolo={animale.defaultViewer?.coloreCiondolo ?? VIEWER_FALLBACK.coloreCiondolo}
                coloreDisegno={animale.defaultViewer?.coloreDisegno ?? VIEWER_FALLBACK.coloreDisegno}
                coloreOcchioSx={VIEWER_FALLBACK.coloreOcchioSx}
                coloreOcchioDx={VIEWER_FALLBACK.coloreOcchioDx}
                occhioSxPos={animale.occhioSxPos}
                occhioDxPos={animale.occhioDxPos}
              />
              <div className={styles.watermark3D}>
                {[...Array(6)].map((_, i) => (
                  <span key={i}>2DOTS·2DOTS·2DOTS·2DOTS</span>
                ))}
              </div>
              <div className={styles.label3D}>↺ ruota</div>
            </div>
          )}

          {/* IMMAGINE PRINCIPALE — solo se non c'è 3D */}
          {!has3D && (
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
          )}

          {/* DISEGNO */}
          {animale.immagineDisegno && (
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

          {/* MATERIALI */}
          <div className={styles.materialiRiga}>
            <span>Ceramica 3D ecosostenibile</span>
            <span>Cristalli Swarovski</span>
            <span>Incisione a punta di diamante</span>
          </div>

          {/* DIMENSIONI */}
          {(animale.dimensioni?.v || animale.dimensioni?.h) && (
            <div className={styles.dimensioni}>
              {animale.dimensioni?.v && animale.dimensioni?.h && (
                <span>circa {animale.dimensioni.v} × {animale.dimensioni.h} cm</span>
              )}
              {animale.occhiMm && <span>Occhi {animale.occhiMm} mm</span>}
            </div>
          )}

          {/* PREZZO */}
          <div className={styles.prezzoBox}>
            <span className={styles.prezzo}>da € {animale.prezzo || 45}</span>
            {animale.prezzoPet && (
              <span className={styles.prezzoPet}>+ € {animale.prezzoPet} per ogni PET aggiunto</span>
            )}
          </div>

          {/* CTA */}
          <Link href={`/configura?animale=${animale.id}`} className={styles.ctaBtn}>
            Configura questo ciondolo →
          </Link>
          <Link href="/bijoux-coppia" className={styles.ctaSecondary}>
            Scopri You &amp; Pet →
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
            <IconInstagram size={16} />
            Guardalo su Instagram
          </a>
        </div>
      )}

    </main>
  );
}
