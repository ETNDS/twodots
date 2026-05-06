"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@styles/adminAnimale.module.css";

type FontForm = {
  id: string;
  nome: string;
  descrizione: string;
  famiglia: string;
  tipo: "sans-serif" | "serif";
  sizePx: number;
  righe: number;
  caratteriPerRiga: number;
  attivo: boolean;
  ordine: number;
};

const EMPTY: FontForm = {
  id: "",
  nome: "",
  descrizione: "",
  famiglia: "Inter",
  tipo: "sans-serif",
  sizePx: 14,
  righe: 3,
  caratteriPerRiga: 15,
  attivo: true,
  ordine: 1,
};

export default function AdminFontDedica() {
  const router = useRouter();
  const params = useParams();
  const isNuovo = params.id === "nuovo";

  const [form, setForm] = useState<FontForm>(EMPTY);
  const [original, setOriginal] = useState<FontForm>(EMPTY);
  const [loading, setLoading] = useState(!isNuovo);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isNuovo) return;
    async function carica() {
      const snap = await getDoc(doc(db, "fontDedica", params.id as string));
      if (!snap.exists()) { router.push("/admin/font"); return; }
      const d = snap.data();
      const f: FontForm = {
        id: snap.id,
        nome: d.nome || "",
        descrizione: d.descrizione || "",
        famiglia: d.famiglia || "Inter",
        tipo: d.tipo || "sans-serif",
        sizePx: d.sizePx || 14,
        righe: d.righe || 3,
        caratteriPerRiga: d.caratteriPerRiga || 15,
        attivo: d.attivo ?? true,
        ordine: d.ordine || 1,
      };
      setForm(f);
      setOriginal(f);
      setLoading(false);
    }
    carica();
  }, [isNuovo, params.id, router]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  function update<K extends keyof FontForm>(key: K, value: FontForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.id.trim()) { alert("Inserisci un ID."); return; }
    setSaving(true);
    try {
      const data: any = {
        nome: form.nome,
        descrizione: form.descrizione,
        famiglia: form.famiglia,
        tipo: form.tipo,
        sizePx: form.sizePx,
        righe: form.righe,
        caratteriPerRiga: form.caratteriPerRiga,
        attivo: form.attivo,
        ordine: form.ordine,
        updatedAt: serverTimestamp(),
      };
      if (isNuovo) data.createdAt = serverTimestamp();
      await setDoc(doc(db, "fontDedica", form.id), data, { merge: !isNuovo });
      setOriginal(form);
      if (isNuovo) router.push(`/admin/font/${form.id}`);
    } catch (e) {
      alert("Errore nel salvataggio.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteDoc(doc(db, "fontDedica", form.id));
      router.push("/admin/font");
    } catch (e) {
      alert("Errore nell'eliminazione.");
      console.error(e);
    }
  }

  // Preview dedica
  const righePreview = Array.from({ length: form.righe }, () => "·".repeat(form.caratteriPerRiga));

  if (loading) return <div className={styles.loading}>Caricamento...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/admin/font")}>← Font dedica</button>
        <h1 className={styles.title}>{isNuovo ? "Nuovo font" : form.nome || "Font"}</h1>
        <div className={styles.headerActions}>
          {!isNuovo && (
            <button className={styles.deleteBtn} onClick={() => setShowDeleteDialog(true)}>Elimina</button>
          )}
          <button className={styles.cancelBtn} onClick={() => router.push("/admin/font")}>Annulla</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.col}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Identificativo</h2>
            <div className={styles.field}>
              <label className={styles.label}>ID documento</label>
              {isNuovo ? (
                <input className={styles.input} value={form.id}
                  onChange={(e) => setForm(p => ({ ...p, id: e.target.value.toLowerCase().replace(/\s/g, "-") }))}
                  placeholder="es. inter-14" />
              ) : (
                <input className={styles.inputReadonly} value={form.id} readOnly />
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nome interno</label>
              <input className={styles.input} value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                placeholder="es. Inter 14px" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Descrizione per l'utente</label>
              <input className={styles.input} value={form.descrizione}
                onChange={(e) => update("descrizione", e.target.value)}
                placeholder="es. Carattere moderno piccolo" />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Font</h2>
            <div className={styles.field}>
              <label className={styles.label}>Famiglia (Google Fonts)</label>
              <input className={styles.input} value={form.famiglia}
                onChange={(e) => update("famiglia", e.target.value)}
                placeholder="es. Inter, Playfair Display" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tipo</label>
              <select className={styles.input} value={form.tipo}
                onChange={(e) => update("tipo", e.target.value as "sans-serif" | "serif")}>
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Size (px)</label>
                <input className={styles.input} type="number" value={form.sizePx}
                  onChange={(e) => update("sizePx", parseInt(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Righe</label>
                <input className={styles.input} type="number" value={form.righe}
                  onChange={(e) => update("righe", parseInt(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Caratteri/riga</label>
                <input className={styles.input} type="number" value={form.caratteriPerRiga}
                  onChange={(e) => update("caratteriPerRiga", parseInt(e.target.value))} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Impostazioni</h2>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Ordine</label>
                <input className={styles.input} type="number" value={form.ordine}
                  onChange={(e) => update("ordine", parseInt(e.target.value))} />
              </div>
            </div>
            <div className={styles.toggleRow}>
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={form.attivo}
                  onChange={(e) => update("attivo", e.target.checked)}
                  className={styles.toggleInput} />
                <span className={styles.toggleText}>{form.attivo ? "Attivo" : "Disabilitato"}</span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Anteprima area dedica</h2>
            <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 12 }}>
              {form.righe} righe × {form.caratteriPerRiga} caratteri — {form.sizePx}px
            </p>
            <div style={{
              border: "1px dashed var(--admin-border)",
              borderRadius: 8,
              padding: 16,
              display: "inline-block",
            }}>
              {righePreview.map((riga, i) => (
                <div key={i} style={{
                  fontFamily: form.famiglia,
                  fontSize: form.sizePx,
                  lineHeight: 1.4,
                  color: "var(--admin-text)",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}>
                  {riga}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginTop: 12 }}>
              Ogni punto rappresenta un carattere disponibile
            </p>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina font</h2>
            <p className={styles.dialogText}>
              Stai per eliminare <strong>{form.nome}</strong>. Operazione irreversibile.
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setShowDeleteDialog(false)}>Annulla</button>
              <button className={styles.dialogDeleteBtn} onClick={handleDelete}>Elimina definitivamente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
