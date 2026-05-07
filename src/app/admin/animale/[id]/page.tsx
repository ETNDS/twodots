"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";
import styles from "@styles/adminAnimale.module.css";

type AnimaleForm = {
  id: string;
  nome: string;
  storia: string;
  forma: string;
  ordine: number;
  dimensioniV: number;
  dimensioniH: number;
  occhiMm: number;
  pubblicato: boolean;
  immagineDisegno: string;
  immagineForma: string;
  immaginiCiondolo: string[];
  igLink: string;
  prezzo: number;
  prezzoPet: number;
};

const EMPTY: AnimaleForm = {
  id: "",
  nome: "",
  storia: "",
  forma: "",
  ordine: 1,
  dimensioniV: 0,
  dimensioniH: 0,
  occhiMm: 2,
  pubblicato: false,
  immagineDisegno: "",
  immagineForma: "",
  immaginiCiondolo: [],
  igLink: "",
  prezzo: 45,
  prezzoPet: 15,
};

export default function AdminAnimale() {
  const router = useRouter();
  const params = useParams();
  const isNuovo = params.id === "nuovo";

  const [form, setForm] = useState<AnimaleForm>(EMPTY);
  const [original, setOriginal] = useState<AnimaleForm>(EMPTY);
  const [loading, setLoading] = useState(!isNuovo);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploadingDisegno, setUploadingDisegno] = useState(false);
  const [uploadingForma, setUploadingForma] = useState(false);
  const [uploadingCiondolo, setUploadingCiondolo] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const [dimVStr, setDimVStr] = useState("");
  const [dimHStr, setDimHStr] = useState("");
  const [occhiStr, setOcchiStr] = useState("");
  const [prezzoStr, setPrezzoStr] = useState("45");
  const [prezzoPetStr, setPrezzoPetStr] = useState("15");

  useEffect(() => {
    if (isNuovo) {
      setOcchiStr("2");
      setPrezzoStr("45");
      setPrezzoPetStr("15");
      return;
    }
    async function carica() {
      const snap = await getDoc(doc(db, "animali", params.id as string));
      if (!snap.exists()) { router.push("/admin/animali"); return; }
      const d = snap.data();
      const f: AnimaleForm = {
        id: snap.id,
        nome: d.nome || "",
        storia: d.storia || "",
        forma: d.forma || "",
        ordine: d.ordine || 1,
        dimensioniV: d.dimensioni?.v || 0,
        dimensioniH: d.dimensioni?.h || 0,
        occhiMm: d.occhiMm || 2,
        pubblicato: d.pubblicato || false,
        immagineDisegno: d.immagineDisegno || "",
        immagineForma: d.immagineForma || "",
        immaginiCiondolo: d.immaginiCiondolo?.filter((x: string) => x) || [],
        igLink: d.igLink || "",
        prezzo: d.prezzo || 45,
        prezzoPet: d.prezzoPet || 15,
      };
      setForm(f);
      setOriginal(f);
      setDimVStr(d.dimensioni?.v ? String(d.dimensioni.v) : "");
      setDimHStr(d.dimensioni?.h ? String(d.dimensioni.h) : "");
      setOcchiStr(d.occhiMm ? String(d.occhiMm) : "2");
      setPrezzoStr(d.prezzo ? String(d.prezzo) : "45");
      setPrezzoPetStr(d.prezzoPet ? String(d.prezzoPet) : "15");
      if (d.createdAt?.toDate) setCreatedAt(d.createdAt.toDate().toLocaleString("it-IT"));
      if (d.updatedAt?.toDate) setUpdatedAt(d.updatedAt.toDate().toLocaleString("it-IT"));
      setLoading(false);
    }
    carica();
  }, [isNuovo, params.id, router]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  const canPubblicato = form.nome.trim() !== "" &&
    form.storia.trim() !== "" &&
    form.immagineDisegno !== "" &&
    form.immaginiCiondolo.length > 0;

  function update<K extends keyof AnimaleForm>(key: K, value: AnimaleForm[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      const canPub = next.nome.trim() !== "" &&
        next.storia.trim() !== "" &&
        next.immagineDisegno !== "" &&
        next.immaginiCiondolo.length > 0;
      if (!canPub) next.pubblicato = false;
      return next;
    });
  }

  function handleDecimalChange(
    raw: string,
    setStr: (s: string) => void,
    key: "dimensioniV" | "dimensioniH" | "occhiMm" | "prezzo" | "prezzoPet"
  ) {
    const normalized = raw.replace(",", ".");
    setStr(raw);
    if (normalized === "" || normalized === ".") { update(key, 0); return; }
    const num = parseFloat(normalized);
    if (!isNaN(num)) update(key, num);
  }

  async function handleSave() {
    if (!form.id.trim()) { alert("Inserisci un ID per l'animale."); return; }
    setSaving(true);
    try {
      const now = serverTimestamp();
      const data: any = {
        nome: form.nome,
        storia: form.storia,
        forma: form.forma,
        ordine: form.ordine,
        dimensioni: { v: form.dimensioniV, h: form.dimensioniH },
        occhiMm: form.occhiMm,
        pubblicato: form.pubblicato,
        immagineDisegno: form.immagineDisegno,
        immagineForma: form.immagineForma,
        immaginiCiondolo: form.immaginiCiondolo,
        igLink: form.igLink,
        prezzo: form.prezzo,
        prezzoPet: form.prezzoPet,
        updatedAt: now,
      };
      if (isNuovo) data.createdAt = now;
      await setDoc(doc(db, "animali", form.id), data, { merge: !isNuovo });
      setOriginal(form);
      if (!isNuovo) {
        const snap = await getDoc(doc(db, "animali", form.id));
        const d = snap.data();
        if (d?.updatedAt?.toDate) setUpdatedAt(d.updatedAt.toDate().toLocaleString("it-IT"));
      }
      if (isNuovo) router.push(`/admin/animale/${form.id}`);
    } catch (e) {
      alert("Errore nel salvataggio.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadDisegno(file: File) {
    setUploadingDisegno(true);
    try {
      const fileRef = ref(storage, `disegni/${form.id || "tmp"}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      update("immagineDisegno", url);
    } catch (e) { console.error(e); }
    finally { setUploadingDisegno(false); }
  }

  async function handleDeleteDisegno() {
    if (!form.immagineDisegno) return;
    try { await deleteObject(ref(storage, form.immagineDisegno)); } catch {}
    update("immagineDisegno", "");
  }

  async function handleUploadForma(file: File) {
    setUploadingForma(true);
    try {
      const fileRef = ref(storage, `forme/${form.id || "tmp"}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      update("immagineForma", url);
    } catch (e) { console.error(e); }
    finally { setUploadingForma(false); }
  }

  async function handleDeleteForma() {
    if (!form.immagineForma) return;
    try { await deleteObject(ref(storage, form.immagineForma)); } catch {}
    update("immagineForma", "");
  }

  async function handleUploadCiondolo(file: File) {
    setUploadingCiondolo(true);
    try {
      const fileRef = ref(storage, `ciondoli/${form.id || "tmp"}_${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      update("immaginiCiondolo", [...form.immaginiCiondolo, url]);
    } catch (e) { console.error(e); }
    finally { setUploadingCiondolo(false); }
  }

  async function handleDeleteCiondolo(url: string) {
    try { await deleteObject(ref(storage, url)); } catch {}
    update("immaginiCiondolo", form.immaginiCiondolo.filter((u) => u !== url));
  }

  function impostaCiondoloPrincipale(url: string) {
    const altre = form.immaginiCiondolo.filter(u => u !== url);
    update("immaginiCiondolo", [url, ...altre]);
  }

  async function handleDelete() {
    try {
      if (form.immagineDisegno) { try { await deleteObject(ref(storage, form.immagineDisegno)); } catch {} }
      if (form.immagineForma) { try { await deleteObject(ref(storage, form.immagineForma)); } catch {} }
      for (const url of form.immaginiCiondolo) { try { await deleteObject(ref(storage, url)); } catch {} }
      await deleteDoc(doc(db, "animali", form.id));
      router.push("/admin/animali");
    } catch (e) {
      alert("Errore nell'eliminazione.");
      console.error(e);
    }
  }

  if (loading) return <div className={styles.loading}>Caricamento...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/admin/animali")}>← Animali</button>
        <h1 className={styles.title}>{isNuovo ? "Nuovo animale" : form.nome || "Animale"}</h1>
        <div className={styles.headerActions}>
          {!isNuovo && (
            <button className={styles.deleteBtn} onClick={() => setShowDeleteDialog(true)}>Elimina</button>
          )}
          <button className={styles.cancelBtn} onClick={() => router.push("/admin/animali")}>Annulla</button>
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
                  onChange={(e) => setForm((p) => ({ ...p, id: e.target.value.toLowerCase().replace(/\s/g, "-") }))}
                  placeholder="es. gatto" />
              ) : (
                <input className={styles.inputReadonly} value={form.id} readOnly />
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nome</label>
              <input className={styles.input} value={form.nome} onChange={(e) => update("nome", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Forma ciondolo</label>
              <input className={styles.input} value={form.forma} onChange={(e) => update("forma", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Link Instagram</label>
              <input className={styles.input} type="url" value={form.igLink}
                onChange={(e) => update("igLink", e.target.value)}
                placeholder="https://instagram.com/p/..." />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Prezzi</h2>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Prezzo YOU (€)</label>
                <input className={styles.input} type="text" inputMode="decimal" value={prezzoStr}
                  onChange={(e) => handleDecimalChange(e.target.value, setPrezzoStr, "prezzo")}
                  placeholder="es. 45" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Prezzo PET (€)</label>
                <input className={styles.input} type="text" inputMode="decimal" value={prezzoPetStr}
                  onChange={(e) => handleDecimalChange(e.target.value, setPrezzoPetStr, "prezzoPet")}
                  placeholder="es. 15" />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Misure</h2>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Dimensione V (cm)</label>
                <input className={styles.input} type="text" inputMode="decimal" value={dimVStr}
                  onChange={(e) => handleDecimalChange(e.target.value, setDimVStr, "dimensioniV")}
                  placeholder="es. 4.5" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Dimensione H (cm)</label>
                <input className={styles.input} type="text" inputMode="decimal" value={dimHStr}
                  onChange={(e) => handleDecimalChange(e.target.value, setDimHStr, "dimensioniH")}
                  placeholder="es. 3.2" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Occhi (mm)</label>
                <input className={styles.input} type="text" inputMode="decimal" value={occhiStr}
                  onChange={(e) => handleDecimalChange(e.target.value, setOcchiStr, "occhiMm")}
                  placeholder="es. 2" />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Ordine</label>
                <input className={styles.input} type="number" step="1" value={form.ordine}
                  onChange={(e) => update("ordine", parseInt(e.target.value))} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Pubblicazione</h2>
            <div className={styles.toggleRow}>
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={form.pubblicato} disabled={!canPubblicato}
                  onChange={(e) => update("pubblicato", e.target.checked)}
                  className={styles.toggleInput} />
                <span className={styles.toggleText}>{form.pubblicato ? "Pubblicato" : "Bozza"}</span>
              </label>
              {!canPubblicato && (
                <p className={styles.toggleNote}>Richiede: nome, storia, immagine disegno e almeno una foto ciondolo.</p>
              )}
            </div>
          </div>

          {!isNuovo && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Metadati</h2>
              <div className={styles.meta}>
                <span className={styles.metaLabel}>Creato</span>
                <span className={styles.metaValue}>{createdAt || "—"}</span>
              </div>
              <div className={styles.meta}>
                <span className={styles.metaLabel}>Ultima modifica</span>
                <span className={styles.metaValue}>{updatedAt || "—"}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.col}>

          <div className={styles.section}>
            <div className={styles.sectionTitleRow}>
              <h2 className={styles.sectionTitle}>Storia</h2>
              <button className={styles.previewBtn} onClick={() => setShowPreview((p) => !p)}>
                {showPreview ? "Modifica" : "Preview"}
              </button>
            </div>
            {!showPreview ? (
              <>
                <textarea className={styles.textarea} value={form.storia}
                  onChange={(e) => update("storia", e.target.value)}
                  placeholder="Scrivi in markdown... es. **grassetto**, *corsivo*"
                  rows={6} />
                <p className={styles.hint}>Supporta markdown: **grassetto**, *corsivo*</p>
              </>
            ) : (
              <div className={styles.preview}>
                <ReactMarkdown>{form.storia}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Disegno animale</h2>
            {form.immagineDisegno ? (
              <div className={styles.imgPreview}>
                <img src={form.immagineDisegno} alt="Disegno" />
                <button className={styles.imgDeleteBtn} onClick={handleDeleteDisegno}>Elimina immagine</button>
              </div>
            ) : (
              <div className={styles.uploadArea}>
                <label className={styles.uploadBtn}>
                  {uploadingDisegno ? "Caricamento in corso..." : "Carica immagine"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingDisegno}
                    onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (!f.type.startsWith("image/")) { alert("File non valido."); return; } handleUploadDisegno(f); }}
                    style={{ display: "none" }} />
                </label>
                {uploadingDisegno && <span className={styles.uploading}>Caricamento in corso...</span>}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Forma ciondolo</h2>
            <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 12 }}>
              Immagine della sagoma del ciondolo — mostrata nel configuratore durante la scelta.
            </p>
            {form.immagineForma ? (
              <div className={styles.imgPreview}>
                <img src={form.immagineForma} alt="Forma ciondolo" />
                <button className={styles.imgDeleteBtn} onClick={handleDeleteForma}>Elimina immagine</button>
              </div>
            ) : (
              <div className={styles.uploadArea}>
                <label className={styles.uploadBtn}>
                  {uploadingForma ? "Caricamento in corso..." : "Carica immagine forma"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingForma}
                    onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (!f.type.startsWith("image/")) { alert("File non valido."); return; } handleUploadForma(f); }}
                    style={{ display: "none" }} />
                </label>
                {uploadingForma && <span className={styles.uploading}>Caricamento in corso...</span>}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Foto ciondolo</h2>
            <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 12 }}>
              La prima foto è quella principale. Clicca "Principale" per spostarla in prima posizione.
            </p>
            <div className={styles.ciondoloGrid}>
              {form.immaginiCiondolo.map((url, i) => (
                <div key={i} className={styles.ciondoloImg}>
                  {i === 0 && (
                    <span style={{ fontSize: 9, background: "var(--admin-sidebar)", color: "var(--admin-sidebar-text)", padding: "2px 6px", borderRadius: 4, marginBottom: 4, display: "inline-block" }}>
                      Principale
                    </span>
                  )}
                  <img src={url} alt={`Ciondolo ${i + 1}`} />
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                    {i > 0 && (
                      <button
                        style={{ fontSize: 10, color: "var(--admin-sidebar)", background: "var(--admin-bg)", border: "0.5px solid var(--admin-border)", padding: "3px 8px", borderRadius: 6, cursor: "pointer" }}
                        onClick={() => impostaCiondoloPrincipale(url)}
                      >
                        Principale
                      </button>
                    )}
                    <button onClick={() => handleDeleteCiondolo(url)}>Elimina</button>
                  </div>
                </div>
              ))}
              <label className={styles.uploadBtn}>
                {uploadingCiondolo ? "Caricamento in corso..." : "+ Aggiungi foto"}
                <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingCiondolo}
                  onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (!f.type.startsWith("image/")) { alert("File non valido."); return; } handleUploadCiondolo(f); }}
                  style={{ display: "none" }} />
              </label>
            </div>
          </div>

        </div>
      </div>

      {showDeleteDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina animale</h2>
            <p className={styles.dialogText}>
              Stai per eliminare <strong>{form.nome}</strong> e tutte le sue immagini. Operazione irreversibile.
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
