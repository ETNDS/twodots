"use client";

import { useEffect, useState } from "react";
import { getPetSizes, savePetSize, deletePetSize, PetSize } from "@/lib/configuratore";
import styles from "@styles/adminAnimali.module.css";
import localStyles from "@styles/adminSconti.module.css";

const EMPTY: Omit<PetSize, "id"> = {
  etichetta: "",
  slug: "",
  ordine: 10,
  attivo: true,
};

export default function PetSizesAdmin() {
  const [sizes, setSizes] = useState<PetSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(PetSize & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  async function carica() {
    const data = await getPetSizes();
    setSizes(data);
    setLoading(false);
  }

  useEffect(() => { carica(); }, []);

  async function handleSalva() {
    if (!editing) return;
    if (!editing.etichetta.trim() || !editing.slug.trim()) {
      alert("Etichetta e slug sono obbligatori.");
      return;
    }
    setSaving(true);
    const { id, isNew, ...data } = editing;
    await savePetSize(isNew ? null : id, data);
    setEditing(null);
    await carica();
    setSaving(false);
  }

  async function handleElimina(id: string) {
    if (!confirm("Eliminare questa taglia?")) return;
    await deletePetSize(id);
    await carica();
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Taglie PET</h1>
      </div>
      <div className={styles.toolbar}>
        <p style={{ fontSize: 13, color: "var(--admin-text-muted)", flex: 1 }}>
          Le taglie vengono mostrate nel configuratore come prima scelta quando si aggiunge il ciondolo PET.
        </p>
        <button className={styles.addBtn} onClick={() => setEditing({ id: "", isNew: true, ...EMPTY })}>
          + Nuova taglia
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Caricamento...</p>
      ) : (
        <div className={localStyles.grid}>
          <div className={localStyles.gridHeader}>
            <span>Ord.</span>
            <span>Etichetta</span>
            <span>Slug</span>
            <span>Stato</span>
            <span></span>
          </div>
          {sizes.map(s => (
            <div key={s.id} className={localStyles.gridRow}>
              <span className={localStyles.colOrdine}>{s.ordine}</span>
              <span>{s.etichetta}</span>
              <span className={localStyles.colCodice}>{s.slug}</span>
              <span className={s.attivo ? styles.badgePub : styles.badgeBozza}>
                {s.attivo ? "Attiva" : "Nascosta"}
              </span>
              <div className={localStyles.colAzioni}>
                <button className={localStyles.btnEdit} onClick={() => setEditing({ ...s })}>Modifica</button>
                <button className={localStyles.btnDelete} onClick={() => handleElimina(s.id)}>Elimina</button>
              </div>
            </div>
          ))}
          {sizes.length === 0 && (
            <p style={{ padding: "20px 0", fontSize: 13, opacity: 0.4, textAlign: "center" }}>
              Nessuna taglia configurata — se vuota, lo step taglia non viene mostrato.
            </p>
          )}
        </div>
      )}

      {editing && (
        <div className={localStyles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className={localStyles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={localStyles.modalTitolo}>{editing.isNew ? "Nuova taglia" : "Modifica taglia"}</h2>

            <div className={localStyles.field}>
              <label className={localStyles.label}>Etichetta (testo mostrato all'utente)</label>
              <input className={localStyles.input} type="text" placeholder="es. Piccolo (fino a 5kg)"
                value={editing.etichetta}
                onChange={e => setEditing(p => ({ ...p!, etichetta: e.target.value }))} />
            </div>

            <div className={localStyles.fieldRow}>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Slug</label>
                <input className={localStyles.input} type="text" placeholder="es. piccolo"
                  value={editing.slug}
                  onChange={e => setEditing(p => ({ ...p!, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} />
              </div>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Ordine</label>
                <input className={localStyles.input} type="number" min={1}
                  value={editing.ordine}
                  onChange={e => setEditing(p => ({ ...p!, ordine: Number(e.target.value) }))} />
              </div>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Stato</label>
                <select className={localStyles.input}
                  value={editing.attivo ? "1" : "0"}
                  onChange={e => setEditing(p => ({ ...p!, attivo: e.target.value === "1" }))}>
                  <option value="1">Attiva</option>
                  <option value="0">Nascosta</option>
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
