"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { getColoriResina, ItemColore } from "@/lib/configuratore";
import ReactMarkdown from "react-markdown";
import styles from "@styles/adminAnimale.module.css";
import ImmagineCard from "@/components/ImmagineCard";
import dynamic from "next/dynamic";

const Viewer3D = dynamic(() => import("@/components/Viewer3D"), { ssr: false });

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
  inEvidenza: boolean;
  immagineDisegno: string;
  immagineForma: string;
  immaginiCiondolo: string[];
  modello3D: string;
  igLink: string;
  prezzo: number;
  prezzoPet: number;
  defaultViewerColore: string;
  defaultViewerDisegno: string;
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
  inEvidenza: false,
  immagineDisegno: "",
  immagineForma: "",
  immaginiCiondolo: [],
  modello3D: "",
  igLink: "",
  prezzo: 45,
  prezzoPet: 15,
  defaultViewerColore: "#1a1a1a",
  defaultViewerDisegno: "#ffffff",
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
  const [coloriResina, setColoriResina] = useState<ItemColore[]>([]);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<"disegno" | "forma" | null>(null);

  // Colori preview viewer 3D (solo test, non salvati)
  const [previewCiondolo, setPreviewCiondolo] = useState("#1a1a1a");
  const [previewSmalto, setPreviewSmalto] = useState("#ffffff");
  const [previewOcchioSx, setPreviewOcchioSx] = useState("#e07010");
  const [previewOcchioDx, setPreviewOcchioDx] = useState("#e07010");
  const [appliedColors, setAppliedColors] = useState({
    ciondolo: "#1a1a1a",
    smalto: "#ffffff",
    occhioSx: "#e07010",
    occhioDx: "#e07010",
  });
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
        inEvidenza: d.inEvidenza ?? false,
        immagineDisegno: d.immagineDisegno || "",
        immagineForma: d.immagineForma || "",
        immaginiCiondolo: d.immaginiCiondolo?.filter((x: string) => x) || [],
        modello3D: d.modello3D || "",
        igLink: d.igLink || "",
        prezzo: d.prezzo || 45,
        prezzoPet: d.prezzoPet || 15,
        defaultViewerColore: d.defaultViewer?.coloreCiondolo || "#1a1a1a",
        defaultViewerDisegno: d.defaultViewer?.coloreDisegno || "#ffffff",
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
    getColoriResina().then(res => setColoriResina(res.filter(r => r.attivo)));
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
      inEvidenza: form.inEvidenza,
        immagineDisegno: form.immagineDisegno,
        immagineForma: form.immagineForma,
        immaginiCiondolo: form.immaginiCiondolo,
        modello3D: form.modello3D,
        igLink: form.igLink,
        prezzo: form.prezzo,
        prezzoPet: form.prezzoPet,
        defaultViewer: {
          coloreCiondolo: form.defaultViewerColore,
          coloreDisegno: form.defaultViewerDisegno,
        },
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
            }));
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

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Misure</h2>
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
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={form.inEvidenza}
                  onChange={(e) => update("inEvidenza", e.target.checked)}
                  className={styles.toggleInput} />
                <span className={styles.toggleText}>{form.inEvidenza ? "In evidenza" : "Non in evidenza"}</span>
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
                  <button title="Elimina" onClick={() => setConfirmDeleteTarget("disegno")} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>🗑️</button>
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
                  <button title="Elimina" onClick={() => setConfirmDeleteTarget("forma")} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>🗑️</button>
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
              <div>
                <p style={{ fontSize: 12, wordBreak: "break-all", color: "var(--admin-text-muted)", marginBottom: 12 }}>
                  ✓ {decodeURIComponent(form.modello3D.split("/").pop()?.split("?")[0] || "")}
                </p>

                {/* Box bordato: viewer + colori */}
                <div style={{ border: "1px solid var(--admin-border)", borderRadius: 10, padding: 16, display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                  {/* Viewer 3D */}
                  <div style={{ width: 280, height: 280, flexShrink: 0, borderRadius: 8, overflow: "hidden", background: "#f5f5f5" }}>
                    <Viewer3D
                        glbUrl={form.modello3D}
                      coloreCiondolo={appliedColors.ciondolo}
                      coloreDisegno={appliedColors.smalto}
                      coloreOcchioSx={appliedColors.occhioSx}
                      coloreOcchioDx={appliedColors.occhioDx}
                    />
                  </div>

                  {/* Color picker + Applica */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {([
                        { label: "Ciondolo", value: previewCiondolo, set: setPreviewCiondolo },
                        { label: "Smalto", value: previewSmalto, set: setPreviewSmalto },
                        { label: "Occhio sx", value: previewOcchioSx, set: setPreviewOcchioSx },
                        { label: "Occhio dx", value: previewOcchioDx, set: setPreviewOcchioDx },
                      ] as { label: string; value: string; set: (v: string) => void }[]).map(({ label, value, set }) => (
                        <div key={label}>
                          <label style={{ fontSize: 11, color: "var(--admin-text-muted)", display: "block", marginBottom: 4 }}>{label}</label>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--admin-border)", borderRadius: 6, padding: "4px 8px" }}>
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => set(e.target.value)}
                              style={{ width: 22, height: 22, padding: 0, border: "none", borderRadius: 4, cursor: "pointer", flexShrink: 0 }}
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) set(v);
                              }}
                              onBlur={(e) => {
                                if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) set(value);
                              }}
                              style={{ flex: 1, fontSize: 12, fontFamily: "monospace", border: "none", outline: "none", background: "transparent", color: "var(--admin-text)", width: 0 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setAppliedColors({ ciondolo: previewCiondolo, smalto: previewSmalto, occhioSx: previewOcchioSx, occhioDx: previewOcchioDx })}
                      title="Aggiorna i colori mostrati nell'anteprima 3D qui sopra"
                      style={{ marginTop: 10, padding: "6px 16px", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "1px solid #999", background: "#444", color: "#fff", cursor: "pointer" }}
                    >
                      Applica colori all&apos;anteprima
                    </button>
                  </div>
                </div>

                {/* Bottoni carica/cancella sotto */}
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button title="Scarica" onClick={() => window.open(form.modello3D, "_blank")} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>💾</button>
                  <button title="Elimina" onClick={() => setShowDeleteModelloDialog(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>🗑️</button>
                </div>
              </div>
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
            <h2 className={styles.sectionTitle}>Anteprima pagina dettaglio</h2>
            <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 12 }}>
              Colori usati nel viewer 3D della pagina pubblica dell&apos;animale.
            </p>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Colore ciondolo</label>
                <select
                  className={styles.input}
                  value={form.defaultViewerColore}
                  onChange={(e) => update("defaultViewerColore", e.target.value)}
                >
                  {coloriResina.map(r => (
                    <option key={r.id} value={r.coloreCSS}>{r.nome}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Colore disegno</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="color"
                    value={form.defaultViewerDisegno}
                    onChange={(e) => update("defaultViewerDisegno", e.target.value)}
                    style={{ width: 40, height: 32, border: "none", cursor: "pointer", background: "none" }}
                  />
                  <input
                    className={styles.input}
                    type="text"
                    value={form.defaultViewerDisegno}
                    onChange={(e) => update("defaultViewerDisegno", e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
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
              Eliminando il modello 3D verrà rimosso il file. Continuare?
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setShowDeleteModelloDialog(false)}>Annulla</button>
              <button className={styles.dialogDeleteBtn} onClick={handleDeleteModello}>Elimina</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteTarget && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>
              Elimina {confirmDeleteTarget === "disegno" ? "disegno animale" : "forma ciondolo"}
            </h2>
            <p className={styles.dialogText}>
              Questa immagine verrà rimossa. Continuare?
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setConfirmDeleteTarget(null)}>Annulla</button>
              <button
                className={styles.dialogDeleteBtn}
                onClick={() => {
                  if (confirmDeleteTarget === "disegno") handleDeleteDisegno();
                  if (confirmDeleteTarget === "forma") handleDeleteForma();
                  setConfirmDeleteTarget(null);
                }}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
