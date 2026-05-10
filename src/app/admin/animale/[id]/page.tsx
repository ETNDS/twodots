"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";
import styles from "@styles/adminAnimale.module.css";
import ImmagineCard from "@/components/ImmagineCard";

type OcchioPos = { x: number; y: number; z: number };

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
  modello3D: string;
  occhioSxPos: OcchioPos | null;
  occhioDxPos: OcchioPos | null;
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
  modello3D: "",
  occhioSxPos: null,
  occhioDxPos: null,
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
  const [showDeleteModelloDialog, setShowDeleteModelloDialog] = useState(false);
  const [uploadingDisegno, setUploadingDisegno] = useState(false);
  const [uploadingForma, setUploadingForma] = useState(false);
  const [uploadingCiondolo, setUploadingCiondolo] = useState(false);
  const [uploadingModello, setUploadingModello] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const [dimVStr, setDimVStr] = useState("");
  const [dimHStr, setDimHStr] = useState("");
  const [occhiStr, setOcchiStr] = useState("");
  const [prezzoStr, setPrezzoStr] = useState("45");
  const [prezzoPetStr, setPrezzoPetStr] = useState("15");

  // Stringhe per i campi posizione occhi
  const [sxX, setSxX] = useState("");
  const [sxY, setSxY] = useState("");
  const [sxZ, setSxZ] = useState("");
  const [dxX, setDxX] = useState("");
  const [dxY, setDxY] = useState("");
  const [dxZ, setDxZ] = useState("");

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
        modello3D: d.modello3D || "",
        occhioSxPos: d.occhioSxPos || null,
        occhioDxPos: d.occhioDxPos || null,
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
      if (d.occhioSxPos) {
        setSxX(String(d.occhioSxPos.x));
        setSxY(String(d.occhioSxPos.y));
        setSxZ(String(d.occhioSxPos.z));
      }
      if (d.occhioDxPos) {
        setDxX(String(d.occhioDxPos.x));
        setDxY(String(d.occhioDxPos.y));
        setDxZ(String(d.occhioDxPos.z));
      }
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

  function handleOcchioChange(
    raw: string,
    setStr: (s: string) => void,
    occhio: "sx" | "dx",
    campo: "x" | "y" | "z"
  ) {
    const normalized = raw.replace(",", ".");
    setStr(raw);
    const num = parseFloat(normalized);
    if (isNaN(num)) return;
    const key = occhio === "sx" ? "occhioSxPos" : "occhioDxPos";
    setForm(prev => {
      const current = prev[key] || { x: 0, y: 0, z: 0 };
      return { ...prev, [key]: { ...current, [campo]: num } };
    });
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
        modello3D: form.modello3D,
        occhioSxPos: form.occhioSxPos,
        occhioDxPos: form.occhioDxPos,
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

  async function handleUploadModello(file: File) {
    setUploadingModello(true);
    try {
      const fileRef = ref(storage, `modelli3d/${form.id || "tmp"}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      update("modello3D", url);
    } catch (e) { console.error(e); }
    finally { setUploadingModello(false); }
  }

  async function handleDeleteModello() {
    if (!form.modello3D) return;
    try { await deleteObject(ref(storage, form.modello3D)); } catch {}
    setForm(prev => ({
      ...prev,
      modello3D: "",
      occhioSxPos: null,
      occhioDxPos: null,
    }));
    setSxX(""); setSxY(""); setSxZ("");
    setDxX(""); setDxY(""); setDxZ("");
    setShowDeleteModelloDialog(false);
  }

  async function handleDelete() {
    try {
      if (form.immagineDisegno) { try { await deleteObject(ref(storage, form.immagineDisegno)); } catch {} }
      if (form.immagineForma) { try { await deleteObject(ref(storage, form.immagineForma)); } catch {} }
      for (const url of form.immaginiCiondolo) { try { await deleteObject(ref(storage, url)); } catch {} }
      if (form.modello3D) { try { await deleteObject(ref(storage, form.modello3D)); } catch {} }
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
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 4 }}>
                  <button title="Scarica" onClick={() => window.open(form.immagineDisegno, "_blank")} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>💾</button>
                  <button title="Elimina" onClick={handleDeleteDisegno} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>🗑️</button>
                </div>
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
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 4 }}>
                  <button title="Scarica" onClick={() => window.open(form.immagineForma, "_blank")} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>💾</button>
                  <button title="Elimina" onClick={handleDeleteForma} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>🗑️</button>
                </div>
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
            <h2 className={styles.sectionTitle}>Modello 3D</h2>
            <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 12 }}>
              File GLB per l'anteprima 3D nel configuratore.
            </p>
            {form.modello3D ? (
              <>
                <div className={styles.imgPreview}>
                  <p style={{ fontSize: 12, wordBreak: "break-all", color: "var(--admin-text-muted)", marginBottom: 8 }}>
                    ✓ {decodeURIComponent(form.modello3D.split("/").pop()?.split("?")[0] || "")}
                  </p>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 4 }}>
                  <button title="Scarica" onClick={() => window.open(form.modello3D, "_blank")} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>💾</button>
                  <button title="Elimina" onClick={() => setShowDeleteModelloDialog(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>🗑️</button>
                </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 8 }}>
                    Posizione occhio sinistro nel viewer 3D
                  </p>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>X</label>
                      <input className={styles.input} type="text" inputMode="decimal" value={sxX}
                        onChange={(e) => handleOcchioChange(e.target.value, setSxX, "sx", "x")}
                        placeholder="0.00" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Y</label>
                      <input className={styles.input} type="text" inputMode="decimal" value={sxY}
                        onChange={(e) => handleOcchioChange(e.target.value, setSxY, "sx", "y")}
                        placeholder="0.00" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Z</label>
                      <input className={styles.input} type="text" inputMode="decimal" value={sxZ}
                        onChange={(e) => handleOcchioChange(e.target.value, setSxZ, "sx", "z")}
                        placeholder="0.00" />
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 8, marginTop: 12 }}>
                    Posizione occhio destro nel viewer 3D
                  </p>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>X</label>
                      <input className={styles.input} type="text" inputMode="decimal" value={dxX}
                        onChange={(e) => handleOcchioChange(e.target.value, setDxX, "dx", "x")}
                        placeholder="0.00" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Y</label>
                      <input className={styles.input} type="text" inputMode="decimal" value={dxY}
                        onChange={(e) => handleOcchioChange(e.target.value, setDxY, "dx", "y")}
                        placeholder="0.00" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Z</label>
                      <input className={styles.input} type="text" inputMode="decimal" value={dxZ}
                        onChange={(e) => handleOcchioChange(e.target.value, setDxZ, "dx", "z")}
                        placeholder="0.00" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.uploadArea}>
                <label className={styles.uploadBtn}>
                  {uploadingModello ? "Caricamento in corso..." : "Carica file GLB"}
                  <input type="file" accept=".glb,.gltf" disabled={uploadingModello}
                    onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; handleUploadModello(f); }}
                    style={{ display: "none" }} />
                </label>
                {uploadingModello && <span className={styles.uploading}>Caricamento in corso...</span>}
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
                <ImmagineCard
                  key={i}
                  url={url}
                  index={i}
                  altText={`Ciondolo ${i + 1}`}
                  onElimina={handleDeleteCiondolo}
                  onPrincipale={impostaCiondoloPrincipale}
                />
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

      {showDeleteModelloDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina modello 3D</h2>
            <p className={styles.dialogText}>
              Eliminando il modello 3D verranno azzerati anche i valori di posizione degli occhi. Continuare?
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setShowDeleteModelloDialog(false)}>Annulla</button>
              <button className={styles.dialogDeleteBtn} onClick={handleDeleteModello}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
