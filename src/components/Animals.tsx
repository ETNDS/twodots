"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getAnimaliPubblicati, Animale } from "@/lib/animali";
import styles from "@styles/animals.module.css";

function primaRiga(testo: string): string {
  const righe = testo.split("\n");
  for (const riga of righe) {
    const pulita = riga.replace(/\*\*/g, "").replace(/\*/g, "").trim();
    if (pulita && !pulita.startsWith("#")) return pulita;
  }
  return "";
}

export default function Animals() {
  const [animali, setAnimali] = useState<Animale[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    getAnimaliPubblicati().then((data) => setAnimali(data));
  }, []);

  function scroll(dir: "left" | "right") {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  }

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    startX.current = e.pageX - (sliderRef.current?.offsetLeft ?? 0);
    scrollLeft.current = sliderRef.current?.scrollLeft ?? 0;
    if (sliderRef.current) sliderRef.current.style.cursor = "grabbing";
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  }

  function onMouseUp() {
    isDragging.current = false;
    if (sliderRef.current) sliderRef.current.style.cursor = "grab";
  }

  if (animali.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Ogni animale ha il suo carattere</h2>
      </div>
      <div className={styles.sliderOuter}>
        <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => scroll("left")} aria-label="Precedente">←</button>
        <div
          className={styles.sliderWrapper}
          ref={sliderRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <div className={styles.slider}>
            {animali.map((animale) => (
              <Link key={animale.id} href={`/collezione/${animale.id}`} className={styles.cardLink}>
                <div className={styles.card}>
                  <div className={styles.imageWrapper}>
                    {animale.immagineDisegno ? (
                      <img
                        src={animale.immagineDisegno}
                        alt={animale.nome}
                      />
                    ) : (
                      <span className={styles.placeholder}>{animale.nome[0]}</span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <p className={styles.name}>{animale.nome}</p>
                    <p className={styles.story}>{primaRiga(animale.storia)}</p>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/collezione" className={styles.cardLink}>
              <div className={styles.cardTutti}>
                <p className={styles.tuttiLabel}>Vedi tutti</p>
                <p className={styles.tuttiArrow}>→</p>
              </div>
            </Link>
          </div>
        </div>
        <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => scroll("right")} aria-label="Successivo">→</button>
      </div>
    </section>
  );
}
