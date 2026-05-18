"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFontDedica, FontDedica } from "@/lib/configuratore";
import styles from "@styles/adminAnimali.module.css";
import localStyles from "@styles/adminFont.module.css";


export default function AdminFont() {
  const [items, setItems] = useState<FontDedica[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getFontDedica().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtrati = items.filter((i) =>
    i.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    i.famiglia.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Font dedica</h1>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input className={styles.filtroInput} type="text" placeholder="Cerca per nome o famiglia..."
            value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <span className={styles.count}>{loading ? "..." : `${filtrati.length} font`}</span>
        </div>
        <button className={styles.addBtn} onClick={() => router.push("/admin/font/nuovo")}>
          + Nuovo font
        </button>
      </div>
      {loading ? (
        <p className={styles.loading}>Caricamento...</p>
      ) : (
        <div className={localStyles.grid}>
          <div className={localStyles.gridHeader}>
            <span>Famiglia</span>
            <span>Pt</span>
            <span>Nome</span>
            <span>Descrizione</span>
            <span>Ord.</span>
            <span>Stato</span>
          </div>
          {filtrati.map((item) => (
            <div key={item.id} className={localStyles.gridRow} onClick={() => router.push(`/admin/font/${item.id}`)}>
              <span className={localStyles.colFamiglia}>{item.famiglia}</span>
              <span className={localStyles.colPt}>{item.sizePx}</span>
              <span className={localStyles.colNome}>{item.nome}</span>
              <span className={localStyles.colDescrizione}>{item.descrizione}</span>
              <span className={localStyles.colOrdine}>{item.ordine}</span>
              <span className={item.attivo ? styles.badgePub : styles.badgeBozza}>
                {item.attivo ? "Attivo" : "Disabilitato"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
