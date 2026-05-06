"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTuttiAnimali, Animale } from "@/lib/animali";
import styles from "@styles/adminAnimali.module.css";

export default function AdminAnimali() {
  const [animali, setAnimali] = useState<Animale[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();


useEffect(() => {
    async function carica() {
        const data = await getTuttiAnimali();
        console.log("Animali:", JSON.stringify(data));
        setAnimali(data);
        setLoading(false);
    }
    carica();
}, []);

  const animaliFiltrari = animali.filter((a) =>
    a.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Animali</h1>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input
            className={styles.filtroInput}
            type="text"
            placeholder="Cerca per nome..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <span className={styles.count}>
            {loading ? "..." : `${animaliFiltrari.length} animali`}
          </span>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => router.push("/admin/animale/nuovo")}
        >
          + Nuovo animale
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Caricamento...</p>
      ) : (
        <div className={styles.grid}>
          <div className={styles.gridHeader}>
            <span></span>
            <span>Nome</span>
            <span>Storia</span>
            <span>Stato</span>
          </div>
          {animaliFiltrari.map((animale) => (
            <div
              key={animale.id}
              className={styles.gridRow}
              onClick={() => router.push(`/admin/animale/${animale.id}`)}
            >
              <div className={styles.gridImg}>
                {animale.immagineDisegno ? (
                  <img src={animale.immagineDisegno} alt={animale.nome} />
                ) : (
                  <span>{animale.nome[0]}</span>
                )}
              </div>
              <div className={styles.gridNome}>{animale.nome}</div>
              <div className={styles.gridStoria}>{animale.storia}</div>
              <div>
                <span className={animale.pubblicato ? styles.badgePub : styles.badgeBozza}>
                  {animale.pubblicato ? "Pubblicato" : "Bozza"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
