"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFontDedica, FontDedica } from "@/lib/configuratore";
import styles from "@styles/adminAnimali.module.css";

export default function AdminFont() {
  const [items, setItems] = useState<FontDedica[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getFontDedica().then((data) => { setItems(data); setLoading(false); });
  }, []);

  const filtrati = items.filter((i) =>
    i.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Font dedica</h1>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input className={styles.filtroInput} type="text" placeholder="Cerca per nome..."
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
        <div className={styles.grid}>
          <div className={styles.gridHeader}>
            <span></span>
            <span>Nome</span>
            <span>Descrizione</span>
            <span>Stato</span>
          </div>
          {filtrati.map((item) => (
            <div key={item.id} className={styles.gridRow} onClick={() => router.push(`/admin/font/${item.id}`)}>
              <div className={styles.gridImg}>
                <span style={{ fontFamily: item.famiglia, fontSize: 18 }}>Aa</span>
              </div>
              <div className={styles.gridNome}>{item.nome}</div>
              <div className={styles.gridStoria}>{item.descrizione}</div>
              <div>
                <span className={item.attivo ? styles.badgePub : styles.badgeBozza}>
                  {item.attivo ? "Attivo" : "Disabilitato"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
