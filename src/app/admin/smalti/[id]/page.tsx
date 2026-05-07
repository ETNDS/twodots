"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import styles from "@styles/adminAnimale.module.css";

type SmaltoForm = {
  id: string;
  nome: string;
  descrizione: string;
  coloreCSS: string;
  immagini: string[];
  attivo: boolean;
  ordine: number;
};

const EMPTY: SmaltoForm = {
  id: "",
  nome: "",
  descrizione: "",
  coloreCSS: "#FFFFFF",
  immagini: [],
  attivo: true,
  ordine: 1,
};

export default function AdminSmalto() {
  const router = useRouter();
  const params = useParams();
  const isNuovo = params.id === "nuovo";

  const [form, setForm] = useState<SmaltoForm>(EMPTY);
  const [original, setOriginal] = useState<SmaltoForm>(EMPTY);
  const [loading, setLoading] = useState(!isNuovo);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isNuovo) return;
    async function carica() {
      const snap = await getDoc(doc(db, "smalti", params.id as string));
      if (!snap.exists()) { router.push("/admin/smalti"); return; }
      const d = snap.data();
      const f: SmaltoForm = {
        id: snap.id,
        nome: d.nome || "",
        descrizione: d.descrizione || "",
        coloreCSS: d.coloreCSS || "#FFFFFF",
        immagini: d.immagini || [],
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

  function update<K extends keyof SmaltoForm>(key: K, value: SmaltoForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

    function impostaPrincipale(url: string) {
    const altre = form.immagini.filter(u => u !== url);
    update("immagini", [url, ...altre]);
    }

  async function handleSave() {
    if (!form.id.trim()) { alert("Inserisci un ID."); return; }
    setSaving(true);
    try {
      const data: any = {
        nome: form.nome,
        descrizione: form.descrizione,
        coloreCSS: form.coloreCSS,
        immagini: form.immagini,
        attivo: form.attivo,
        ordine: form.ordine,
        updatedAt: serverTimestamp(),
      };
      if (isNuovo) data.createdAt = serverTimestamp();
      await setDoc(doc(db, "smalti", form.id), data, { merge: !isNuovo });
      setOriginal(form);
      if (isNuovo) router.push(`/admin/smalti/${form.id}`);
    } catch (e) {
      alert("Errore nel salvataggio.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fileRef = ref(storage, `smalti/${form.id || "tmp"}_${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      update("immagini", [...form.immagini, url]);
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  }

  async function handleDeleteImmagine(url: string) {
    try { await deleteObject(ref(storage, url)); } catch {}
    update("immagini", form.immagini.filter((u) => u !== url));
  }

  async function handleDelete() {
    try {
      for (const url of form.immagini) {
        try { await deleteObject(ref(storage, url)); } catch {}
      }
      await deleteDoc(doc(db, "smalti", form.id));
      router.push("/admin/smalti");
    } catch (e) {
      alert("Errore nell'eliminazione.");
      console.error(e);
    }
  }

  if (loading) return <div className={styles.loading}>Caricamento...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/admin/smalti")}>← Smalti</button>
        <h1 className={styles.title}>{isNuovo ? "Nuovo smalto" : form.nome || "Smalto"}</h1>
        <div className={styles.headerActions}>
          {!isNuovo && (
            <button className={styles.deleteBtn} onClick={() => setShowDeleteDialog(true)}>Elimina</button>
          )}
          <button className={styles.cancelBtn} onClick={() => router.push("/admin/smalti")}>Annulla</button>
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
                  placeholder="es. bianco" />
              ) : (
                <input className={styles.inputReadonly} value={form.id} readOnly />
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nome</label>
              <input className={styles.input} value={form.nome} onChange={(e) => update("nome", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Descrizione</label>
              <input className={styles.input} value={form.descrizione} onChange={(e) => update("descrizione", e.target.value)} />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Colore</h2>
            <div className={styles.field}>
              <label className={styles.label}>Colore CSS</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={form.coloreCSS}
                  onChange={(e) => update("coloreCSS", e.target.value)}
                  style={{ width: 48, height: 36, border: "none", cursor: "pointer", borderRadius: 6 }} />
                <input className={styles.input} value={form.coloreCSS}
                  onChange={(e) => update("coloreCSS", e.target.value)}
                  placeholder="#FFFFFF" style={{ flex: 1 }} />
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
                <h2 className={styles.sectionTitle}>Immagini</h2>
                <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 12 }}>
                    La prima immagine è quella principale. Clicca "Principale" per spostarla in prima posizione.
                </p>
                <div className={styles.ciondoloGrid}>
                    {form.immagini.map((url, i) => (
                        <div key={i} className={styles.ciondoloImg}>
                            {i === 0 && (
                            <span style={{ fontSize: 9, background: "var(--admin-sidebar)", color: "var(--admin-sidebar-text)", padding: "2px 6px", borderRadius: 4, marginBottom: 4, display: "inline-block" }}>
                                Principale
                            </span>
                            )}
                            <img src={url} alt={`Immagine ${i + 1}`} />
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                            {i > 0 && (
                                <button
                                style={{ fontSize: 10, color: "var(--admin-sidebar)", background: "var(--admin-bg)", border: "0.5px solid var(--admin-border)", padding: "3px 8px", borderRadius: 6, cursor: "pointer" }}
                                onClick={() => impostaPrincipale(url)}
                                >
                                Principale
                                </button>
                            )}
                            <button onClick={() => handleDeleteImmagine(url)}>Elimina</button>
                            </div>
                        </div>
                    ))}
                    <label className={styles.uploadBtn}>
                        {uploading ? "Caricamento..." : "+ Aggiungi immagine"}
                        <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                            style={{ display: "none" }} />
                    </label>
                </div>
            </div>
          
        </div>
      </div>

      {showDeleteDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina smalto</h2>
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
