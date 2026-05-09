"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTuttiAnimali, Animale } from "@/lib/animali";
import styles from "@styles/adminAnimali.module.css";

type SortKey = "nome" | "ordine";

const COLONNE = "48px 180px 1fr 60px 100px";

export default function AdminAnimali() {
  const [animali, setAnimali] = useState<Animale[]>([]);
  const [filtro, setFiltro] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("ordine");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function carica() {
      const data = await getTuttiAnimali();
      setAnimali(data);
      setLoading(false);
    }
    carica();
  }, []);

  const filtrati = animali
    .filter((a) => a.nome.toLowerCase().includes(filtro.toLowerCase()))
    .sort((a, b) => sortKey === "nome" ? a.nome.localeCompare(b.nome) : (a.ordine ?? 999) - (b.ordine ?? 999));

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
            {loading ? "..." : `${filtrati.length} animali`}
          </span>
        </div>
        <button className={styles.addBtn} onClick={() => router.push("/admin/animale/nuovo")}>
          + Nuovo animale
        </button>
      </div>
      {loading ? (
        <p className={styles.loading}>Caricamento...</p>
      ) : (
        <div className={styles.grid}>
          <div className={styles.gridHeader} style={{ gridTemplateColumns: COLONNE }}>
            <span></span>
            <span>Nome</span>
            <span>Storia</span>
            <span
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => setSortKey(sortKey === "ordine" ? "nome" : "ordine")}
            >
              Ord {sortKey === "ordine" ? "↑" : "az"}
            </span>
            <span>Stato</span>
          </div>
          {filtrati.map((animale) => (
            <div
              key={animale.id}
              className={styles.gridRow}
              style={{ gridTemplateColumns: COLONNE }}
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
              <div style={{ fontSize: 12, opacity: 0.6 }}>{animale.ordine}</div>
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
