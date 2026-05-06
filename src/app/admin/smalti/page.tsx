"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSmalti, ItemColore } from "@/lib/configuratore";
import styles from "@styles/adminAnimali.module.css";

export default function AdminSmalti() {
  const [items, setItems] = useState<ItemColore[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSmalti().then((data) => { setItems(data); setLoading(false); });
  }, []);

  const filtrati = items.filter((i) =>
    i.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Smalti</h1>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input className={styles.filtroInput} type="text" placeholder="Cerca per nome..."
            value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <span className={styles.count}>{loading ? "..." : `${filtrati.length} smalti`}</span>
        </div>
        <button className={styles.addBtn} onClick={() => router.push("/admin/smalti/nuovo")}>
          + Nuovo smalto
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
            <div key={item.id} className={styles.gridRow} onClick={() => router.push(`/admin/smalti/${item.id}`)}>
              <div className={styles.gridImg}>
                {item.immagini?.[0] ? (
                  <img src={item.immagini[0]} alt={item.nome} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: item.coloreCSS, border: "1px solid rgba(0,0,0,0.1)" }} />
                )}
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
