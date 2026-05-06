"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getConfezioni, Confezione } from "@/lib/configuratore";
import styles from "@styles/adminAnimali.module.css";

export default function AdminConfezioni() {
  const [items, setItems] = useState<Confezione[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getConfezioni().then((data) => { setItems(data); setLoading(false); });
  }, []);

  const filtrati = items.filter((i) =>
    i.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Confezioni</h1>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input className={styles.filtroInput} type="text" placeholder="Cerca per nome..."
            value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <span className={styles.count}>{loading ? "..." : `${filtrati.length} confezioni`}</span>
        </div>
        <button className={styles.addBtn} onClick={() => router.push("/admin/confezioni/nuovo")}>
          + Nuova confezione
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
            <div key={item.id} className={styles.gridRow} onClick={() => router.push(`/admin/confezioni/${item.id}`)}>
              <div className={styles.gridImg}>
                {item.immagini?.[0] ? (
                  <img src={item.immagini[0]} alt={item.nome} />
                ) : (
                  <span>{item.nome[0]}</span>
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
