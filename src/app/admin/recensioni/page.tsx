"use client";

import { useState } from "react";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { aggiornaStatoRecensione, Recensione, StatoRecensione } from "@/lib/recensioni";
import styles from "@styles/adminAnimali.module.css";
import recensioniStyles from "@styles/adminRecensioni.module.css";

export default function AdminRecensioni() {
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [cercato, setCercato] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtri per la query Firestore
  const [filtroStato, setFiltroStato] = useState<StatoRecensione | "">( "bozza");
  const [filtroDal, setFiltroDal] = useState("");
  const [filtroAl, setFiltroAl] = useState("");

  // Filtro nome — lato client, attivo solo dopo ricerca
  const [filtroNome, setFiltroNome] = useState("");

  async function cerca() {
    setLoading(true);
    setCercato(false);

    const condizioni: any[] = [];

    if (filtroStato) {
      condizioni.push(where("stato", "==", filtroStato));
    }
    if (filtroDal) {
      condizioni.push(where("createdAt", ">=", Timestamp.fromDate(new Date(filtroDal))));
    }
    if (filtroAl) {
      condizioni.push(where("createdAt", "<=", Timestamp.fromDate(new Date(filtroAl + "T23:59:59"))));
    }

    condizioni.push(orderBy("createdAt", "desc"));

    const q = query(collection(db, "recensioni"), ...condizioni);
    const snap = await getDocs(q);

    const risultati: Recensione[] = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        nome: data.nome || "",
        email: data.email || "",
        stelle: data.stelle || 1,
        commento: data.commento || "",
        stato: data.stato || "bozza",
        createdAt: data.createdAt?.toDate() || null,
        immagineUrl: data.immagineUrl || undefined,
      };
    });

    setRecensioni(risultati);
    setCercato(true);
    setLoading(false);
  }

  async function cambiaStato(id: string, stato: StatoRecensione) {
    await aggiornaStatoRecensione(id, stato);
    setRecensioni(prev => prev.map(r => r.id === id ? { ...r, stato } : r));
  }

  // Filtro nome applicato lato client solo dopo ricerca
  const filtrate = cercato && filtroNome
    ? recensioni.filter(r => r.nome.toLowerCase().includes(filtroNome.toLowerCase()))
    : recensioni;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Recensioni</h1>
      </div>

      <div className={recensioniStyles.toolbarFiltri}>
          <select
            className={recensioniStyles.filtroCompatto}
            value={filtroStato}
            onChange={e => setFiltroStato(e.target.value as StatoRecensione | "")}
          >
            <option value="">Tutti gli stati</option>
            <option value="bozza">Bozza</option>
            <option value="approvata">Approvata</option>
            <option value="rifiutata">Rifiutata</option>
          </select>
          <input
            className={recensioniStyles.filtroCompatto}
            type="date"
            value={filtroDal}
            onChange={e => setFiltroDal(e.target.value)}
            title="Dal"
          />
          <input
            className={recensioniStyles.filtroCompatto}
            type="date"
            value={filtroAl}
            onChange={e => setFiltroAl(e.target.value)}
            title="Al"
          />
          <input
            className={`${recensioniStyles.filtroCompatto} ${!cercato ? recensioniStyles.filtroNomeDisabilitato : ""}`}
            type="text"
            placeholder={cercato ? "Nome..." : "Nome (dopo ricerca)"}
            value={filtroNome}
            onChange={e => cercato && setFiltroNome(e.target.value)}
            disabled={!cercato}
          />
          <button className={styles.addBtn} onClick={cerca}>
            Cerca
          </button>
      </div>

      {cercato && (
        <div className={recensioniStyles.contatoreRiga}>
          {filtrate.length} {filtrate.length === 1 ? "recensione trovata" : "recensioni trovate"}
        </div>
      )}

      {loading && <p className={styles.loading}>Caricamento...</p>}

      {cercato && !loading && (
        <>
          <div className={recensioniStyles.grigliaTesta}>
            <span>Nome / Data</span>
            <span>Commento</span>
            <span>Stelle</span>
            <span>Stato</span>
            <span>Azioni</span>
          </div>
          {filtrate.length === 0 ? (
            <p className={styles.loading}>Nessun risultato.</p>
          ) : (
            filtrate.map(r => (
              <div key={r.id} className={recensioniStyles.grigliaRiga}>
                <div className={recensioniStyles.cellaNome}>
                  <div>{r.nome}</div>
                  {r.createdAt && (
                    <div className={recensioniStyles.data}>
                      {r.createdAt.toLocaleDateString("it-IT")}
                    </div>
                  )}
                </div>
                <div className={recensioniStyles.cellaCommento}>
                  {r.commento}
                  {r.immagineUrl && (
                    <img
                      src={r.immagineUrl}
                      alt="Foto recensione"
                      className={recensioniStyles.imgAnteprima}
                    />
                  )}
                </div>
                <div>{"\u2605".repeat(r.stelle)}</div>
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
            ))
          )}
        </>
      )}
    </div>
  );
}
