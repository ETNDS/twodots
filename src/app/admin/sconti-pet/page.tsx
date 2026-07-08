"use client";

import { useEffect, useState } from "react";
import { getFasceScontoPet, saveFasciaScontoPet, deleteFasciaScontoPet, FasciaScontoPet } from "@/lib/configuratore";
import styles from "@styles/adminAnimali.module.css";
import localStyles from "@styles/adminSconti.module.css";

const EMPTY: Omit<FasciaScontoPet, "id"> = {
  da: 2,
  percentuale: 5,
  codiceShopify: "",
  attivo: true,
  ordine: 10,
};

export default function ScontiPetAdmin() {
  const [fasce, setFasce] = useState<FasciaScontoPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(FasciaScontoPet & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("ordine");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function sortIcon(key: string) {
    if (sortKey !== key) return null;
    return <span style={{ opacity: 0.6, fontSize: 10 }}>{sortDir === "asc" ? " ↑" : " ↓"}</span>;
  }

  function sorted<T>(data: T[]): T[] {
    return [...data].sort((a: any, b: any) => {
      const va = a[sortKey]; const vb = b[sortKey];
      if (va == null) return 1; if (vb == null) return -1;
      const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }


  async function carica() {
    const data = await getFasceScontoPet();
    setFasce(data);
    setLoading(false);
  }

  useEffect(() => { carica(); }, []);

  async function handleSalva() {
    if (!editing) return;
    if (!editing.codiceShopify.trim()) { alert("Inserisci il codice Shopify."); return; }
    setSaving(true);
    const { id, isNew, ...data } = editing;
    await saveFasciaScontoPet(isNew ? null : id, data);
    setEditing(null);
    await carica();
    setSaving(false);
  }

  async function handleElimina(id: string) {
    await deleteFasciaScontoPet(id);
    await carica();
    setConfirmDelete(null);
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Sconti PET per quantità</h1>
      </div>
      <div className={styles.toolbar}>
        <p style={{ fontSize: 13, color: "var(--admin-text-muted)", flex: 1 }}>
          Sconti applicati al totale PET in base al numero di PET associati allo stesso bijoux YOU.
          Per ogni fascia crea un discount code separato su Shopify Admin.
        </p>
        <button className={styles.addBtn} onClick={() => setEditing({ id: "", isNew: true, ...EMPTY })}>
          + Nuova fascia
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Caricamento...</p>
      ) : (
        <div className={localStyles.grid}>
          <div className={localStyles.gridHeader}>
            <span onClick={() => handleSort("ordine")} style={{ cursor: "pointer", userSelect: "none" }}>Ord{sortIcon("ordine")}</span>
            <span onClick={() => handleSort("da")} style={{ cursor: "pointer", userSelect: "none" }}>Da (pezzi){sortIcon("da")}</span>
            <span onClick={() => handleSort("percentuale")} style={{ cursor: "pointer", userSelect: "none" }}>Sconto %{sortIcon("percentuale")}</span>
            <span onClick={() => handleSort("codiceShopify")} style={{ cursor: "pointer", userSelect: "none" }}>Codice Shopify{sortIcon("codiceShopify")}</span>
            <span>Stato</span>
            <span></span>
          </div>
          {sorted(fasce).map((f) => (
            <div key={f.id} className={localStyles.gridRow}>
              <span className={localStyles.colOrdine}>{f.ordine}</span>
              <span className={localStyles.colDa}>{f.da}+</span>
              <span className={localStyles.colPerc}>{f.percentuale}%</span>
              <span className={localStyles.colCodice}>{f.codiceShopify}</span>
              <span className={f.attivo ? styles.badgePub : styles.badgeBozza}>
                {f.attivo ? "Attiva" : "Disabilitata"}
              </span>
              <div className={localStyles.colAzioni}>
                <button className={localStyles.btnEdit} onClick={() => setEditing({ ...f })} title="Modifica">✏️</button>
                <button className={localStyles.btnDelete} onClick={() => setConfirmDelete(f.id)} title="Elimina">🗑️</button>
              </div>
            </div>
          ))}
          {fasce.length === 0 && <p style={{ padding: "20px 0", fontSize: 13, opacity: 0.4, textAlign: "center" }}>Nessuna fascia configurata.</p>}
        </div>
      )}

      {confirmDelete && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina fascia sconto PET</h2>
            <p className={styles.dialogText}>Eliminare questa fascia? L&apos;operazione è irreversibile.</p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setConfirmDelete(null)}>Annulla</button>
              <button className={styles.dialogDeleteBtn} onClick={() => handleElimina(confirmDelete!)} title="Elimina">🗑️</button>
            </div>
          </div>
        </div>
      )}


      {editing && (
        <div className={localStyles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className={localStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={localStyles.modalTitolo}>{editing.isNew ? "Nuova fascia sconto PET" : "Modifica fascia"}</h2>

            <div className={localStyles.fieldRow}>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Da (n. PET)</label>
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
              <input className={localStyles.input} type="text" placeholder="es. TWODOTSPET2"
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
