"use client";

import { useEffect, useState } from "react";
import { getFasceSconto, saveFasciaSconto, deleteFasciaSconto, FasciaSconto } from "@/lib/configuratore";
import styles from "@styles/adminAnimali.module.css";
import localStyles from "@styles/adminSconti.module.css";

const EMPTY: Omit<FasciaSconto, "id"> = {
  da: 2,
  percentuale: 5,
  codiceShopify: "",
  attivo: true,
  ordine: 10,
};

export default function AdminSconti() {
  const [fasce, setFasce] = useState<FasciaSconto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FasciaSconto | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function carica() {
    const data = await getFasceSconto();
    setFasce(data);
    setLoading(false);
  }

  useEffect(() => { carica(); }, []);

  function apriNuovo() {
    setEditing({ id: "", ...EMPTY });
    setIsNew(true);
  }

  function apriEditing(f: FasciaSconto) {
    setEditing({ ...f });
    setIsNew(false);
  }

  async function handleSalva() {
    if (!editing) return;
    if (!editing.codiceShopify.trim()) { alert("Inserisci il codice Shopify."); return; }
    setSaving(true);
    try {
      await saveFasciaSconto(isNew ? null : editing.id, {
        da: editing.da,
        percentuale: editing.percentuale,
        codiceShopify: editing.codiceShopify.trim().toUpperCase(),
        attivo: editing.attivo,
        ordine: editing.ordine,
      });
      setEditing(null);
      await carica();
    } finally {
      setSaving(false);
    }
  }

  async function handleElimina(id: string) {
    if (!confirm("Eliminare questa fascia?")) return;
    await deleteFasciaSconto(id);
    await carica();
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Sconti per quantità</h1>
      </div>
      <div className={styles.toolbar}>
        <p className={localStyles.intro}>
          Le fasce attive vengono applicate automaticamente al checkout in base al numero di pezzi nel carrello.
          Per ogni fascia crea un discount code corrispondente su Shopify Admin.
        </p>
        <button className={styles.addBtn} onClick={apriNuovo}>+ Nuova fascia</button>
      </div>

      {loading ? (
        <p className={styles.loading}>Caricamento...</p>
      ) : (
        <div className={localStyles.grid}>
          <div className={localStyles.gridHeader}>
            <span>Da (pezzi)</span>
            <span>Sconto %</span>
            <span>Codice Shopify</span>
            <span>Ord.</span>
            <span>Stato</span>
            <span></span>
          </div>
          {fasce.map((f) => (
            <div key={f.id} className={localStyles.gridRow}>
              <span className={localStyles.colDa}>{f.da}+</span>
              <span className={localStyles.colPerc}>{f.percentuale}%</span>
              <span className={localStyles.colCodice}>{f.codiceShopify}</span>
              <span className={localStyles.colOrdine}>{f.ordine}</span>
              <span className={f.attivo ? styles.badgePub : styles.badgeBozza}>
                {f.attivo ? "Attiva" : "Disabilitata"}
              </span>
              <div className={localStyles.colAzioni}>
                <button className={localStyles.btnEdit} onClick={() => apriEditing(f)}>Modifica</button>
                <button className={localStyles.btnDelete} onClick={() => handleElimina(f.id)}>Elimina</button>
              </div>
            </div>
          ))}
          {fasce.length === 0 && (
            <p className={localStyles.vuoto}>Nessuna fascia configurata.</p>
          )}
        </div>
      )}

      {editing && (
        <div className={styles.popupOverlay || localStyles.overlay} onClick={() => setEditing(null)}>
          <div className={localStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={localStyles.modalTitolo}>{isNew ? "Nuova fascia sconto" : "Modifica fascia"}</h2>

            <div className={localStyles.fieldRow}>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Da (n. pezzi)</label>
                <input className={localStyles.input} type="number" min={1}
                  value={editing.da} onChange={(e) => setEditing(p => ({ ...p!, da: Number(e.target.value) }))} />
              </div>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Sconto %</label>
                <input className={localStyles.input} type="number" min={1} max={50}
                  value={editing.percentuale} onChange={(e) => setEditing(p => ({ ...p!, percentuale: Number(e.target.value) }))} />
              </div>
            </div>

            <div className={localStyles.field}>
              <label className={localStyles.label}>Codice Shopify</label>
              <input className={localStyles.input} type="text" placeholder="es. TWODOTS5"
                value={editing.codiceShopify} onChange={(e) => setEditing(p => ({ ...p!, codiceShopify: e.target.value }))} />
              <p className={localStyles.hint}>Deve corrispondere esattamente al codice creato su Shopify Admin.</p>
            </div>

            <div className={localStyles.fieldRow}>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Ordine</label>
                <input className={localStyles.input} type="number" min={1}
                  value={editing.ordine} onChange={(e) => setEditing(p => ({ ...p!, ordine: Number(e.target.value) }))} />
              </div>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Stato</label>
                <select className={localStyles.input}
                  value={editing.attivo ? "1" : "0"}
                  onChange={(e) => setEditing(p => ({ ...p!, attivo: e.target.value === "1" }))}>
                  <option value="1">Attiva</option>
                  <option value="0">Disabilitata</option>
                </select>
              </div>
            </div>

            <div className={localStyles.modalAzioni}>
              <button className={localStyles.btnAnnulla} onClick={() => setEditing(null)}>Annulla</button>
              <button className={localStyles.btnSalva} onClick={handleSalva} disabled={saving}>
                {saving ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
