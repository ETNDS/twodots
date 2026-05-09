"use client";

import { useEffect, useState } from "react";
import { getTutteRecensioni, aggiornaStatoRecensione, Recensione, StatoRecensione } from "@/lib/recensioni";
import styles from "@styles/adminAnimali.module.css";
import recensioniStyles from "@styles/adminRecensioni.module.css";

export default function AdminRecensioni() {
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroDal, setFiltroDal] = useState("");
  const [filtroAl, setFiltroAl] = useState("");
  const [filtroStato, setFiltroStato] = useState<StatoRecensione | "">("");

  useEffect(() => {
    getTutteRecensioni().then(r => { setRecensioni(r); setLoading(false); });
  }, []);

  async function cambiaStato(id: string, stato: StatoRecensione) {
    await aggiornaStatoRecensione(id, stato);
    setRecensioni(prev => prev.map(r => r.id === id ? { ...r, stato } : r));
  }

  const filtrate = recensioni.filter(r => {
    if (filtroNome && !r.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;
    if (filtroStato && r.stato !== filtroStato) return false;
    if (filtroDal && r.createdAt && r.createdAt < new Date(filtroDal)) return false;
    if (filtroAl && r.createdAt && r.createdAt > new Date(filtroAl + "T23:59:59")) return false;
    return true;
  });

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Recensioni</h1>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input className={styles.filtroInput} type="text" placeholder="Cerca per nome..."
            value={filtroNome} onChange={e => setFiltroNome(e.target.value)} />
          <input className={styles.filtroInput} type="date" value={filtroDal}
            onChange={e => setFiltroDal(e.target.value)} title="Dal" />
          <input className={styles.filtroInput} type="date" value={filtroAl}
            onChange={e => setFiltroAl(e.target.value)} title="Al" />
          <select className={styles.filtroInput} value={filtroStato}
            onChange={e => setFiltroStato(e.target.value as StatoRecensione | "")}>
            <option value="">Tutti gli stati</option>
            <option value="bozza">Bozza</option>
            <option value="approvata">Approvata</option>
            <option value="rifiutata">Rifiutata</option>
          </select>
          <span className={styles.count}>{loading ? "..." : `${filtrate.length} recensioni`}</span>
        </div>
      </div>
      {loading ? (
        <p className={styles.loading}>Caricamento...</p>
      ) : (
        <div className={styles.grid}>
          <div className={styles.gridHeader} style={{ gridTemplateColumns: "140px 1fr 80px 120px 180px" }}>
            <span>Nome</span>
            <span>Commento</span>
            <span>Stelle</span>
            <span>Stato</span>
            <span>Azioni</span>
          </div>
          {filtrate.map(r => (
            <div key={r.id} className={styles.gridRow} style={{ gridTemplateColumns: "140px 1fr 80px 120px 180px" }}>
              <div className={styles.gridNome}>
                <div>{r.nome}</div>
                {r.createdAt && (
                  <div style={{ fontSize: 10, opacity: 0.5 }}>
                    {r.createdAt.toLocaleDateString("it-IT")}
                  </div>
                )}
              </div>
              <div className={styles.gridStoria}>{r.commento}</div>
              <div>{"★".repeat(r.stelle)}</div>
              <div>
                <span className={
                  r.stato === "approvata" ? styles.badgePub :
                  r.stato === "rifiutata" ? recensioniStyles.badgeRifiutata :
                  styles.badgeBozza
                }>
                  {r.stato}
                </span>
              </div>
              <div className={recensioniStyles.azioni}>
                {r.stato !== "approvata" && (
                  <button className={recensioniStyles.btnApprova} onClick={() => cambiaStato(r.id, "approvata")}>Approva</button>
                )}
                {r.stato !== "rifiutata" && (
                  <button className={recensioniStyles.btnRifiuta} onClick={() => cambiaStato(r.id, "rifiutata")}>Rifiuta</button>
                )}
                {r.stato !== "bozza" && (
                  <button className={recensioniStyles.btnBozza} onClick={() => cambiaStato(r.id, "bozza")}>Bozza</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
