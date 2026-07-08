"use client";

import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getPetCiondolo, savePetCiondolo, PetCiondolo, getColoriResina, ItemColore } from "@/lib/configuratore";
import dynamic from "next/dynamic";
import styles from "@styles/adminAnimale.module.css";

const Viewer3D = dynamic(() => import("@/components/Viewer3D"), { ssr: false });

const EMPTY: PetCiondolo = {
  immagineForma: "",
  modello3D: "",
};

export default function AdminPet() {
  const [form, setForm] = useState<PetCiondolo>(EMPTY);
  const [original, setOriginal] = useState<PetCiondolo>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingForma, setUploadingForma] = useState(false);
  const [uploadingModello, setUploadingModello] = useState(false);
  const [showDeleteModelloDialog, setShowDeleteModelloDialog] = useState(false);
  const [confirmDeleteForma, setConfirmDeleteForma] = useState(false);

  const [coloriResina, setColoriResina] = useState<ItemColore[]>([]);
  const [previewCiondolo, setPreviewCiondolo] = useState("#1a1a1a");
  const [previewOcchioSx, setPreviewOcchioSx] = useState("#e07010");
  const [previewOcchioDx, setPreviewOcchioDx] = useState("#e07010");
  const [appliedColors, setAppliedColors] = useState({
    ciondolo: "#1a1a1a",
    occhioSx: "#e07010",
    occhioDx: "#e07010",
  });

  useEffect(() => {
    getPetCiondolo().then((data) => {
      const f = data || EMPTY;
      setForm(f);
      setOriginal(f);
      setLoading(false);
    });
    getColoriResina().then(res => setColoriResina(res.filter(r => r.attivo)));
  }, []);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  function update(partial: Partial<PetCiondolo>) {
    setForm(p => ({ ...p, ...partial }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await savePetCiondolo(form);
      setOriginal(form);
    } catch (e) {
      alert("Errore nel salvataggio.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadForma(file: File) {
    setUploadingForma(true);
    try {
      const fileRef = ref(storage, `pet/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      update({ immagineForma: url });
    } catch (e) { console.error(e); }
    finally { setUploadingForma(false); }
  }

  async function handleDeleteForma() {
    if (!form.immagineForma) return;
    try { await deleteObject(ref(storage, form.immagineForma)); } catch {}
    update({ immagineForma: "" });
  }

  async function handleUploadModello(file: File) {
    setUploadingModello(true);
    try {
      const fileRef = ref(storage, `pet/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      update({ modello3D: url });
    } catch (e) { console.error(e); }
    finally { setUploadingModello(false); }
  }

  async function handleDeleteModello() {
    if (!form.modello3D) return;
    try { await deleteObject(ref(storage, form.modello3D)); } catch {}
    setForm(p => ({ ...p, modello3D: "" }));
    setAppliedColors({ ciondolo: "#1a1a1a", occhioSx: "#e07010", occhioDx: "#e07010" });
    setPreviewCiondolo("#1a1a1a");
    setPreviewOcchioSx("#e07010");
    setPreviewOcchioDx("#e07010");
    setShowDeleteModelloDialog(false);
  }

  if (loading) return <div className={styles.loading}>Caricamento...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ciondolo PET</h1>
        <div className={styles.headerActions}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.col}>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Immagine ciondolo PET</h2>
            <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 12 }}>
              Immagine della forma del ciondolo PET — mostrata nel configuratore.
            </p>
            {form.immagineForma ? (
              <div className={styles.imgPreview}>
                <img src={form.immagineForma} alt="Ciondolo PET" />
                <div style={{ display: "flex", gap: 6 }}>
                  <button title="Scarica" onClick={() => window.open(form.immagineForma, "_blank")}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>💾</button>
                  <button title="Elimina" onClick={() => setConfirmDeleteForma(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                </div>
              </div>
            ) : (
              <div className={styles.uploadArea}>
                <label className={styles.uploadBtn}>
                  {uploadingForma ? "Caricamento..." : "Carica immagine"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingForma}
                    onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; handleUploadForma(f); }}
                    style={{ display: "none" }} />
                </label>
              </div>
            )}
          </div>

        </div>

        <div className={styles.col}>

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
                      coloreDisegno={null}
                      coloreOcchioSx={appliedColors.occhioSx}
                      coloreOcchioDx={appliedColors.occhioDx}
                    />
                  </div>

                  {/* Color picker + Applica */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {([
                        { label: "Resina", value: previewCiondolo, set: setPreviewCiondolo },
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
                      onClick={() => setAppliedColors({ ciondolo: previewCiondolo, occhioSx: previewOcchioSx, occhioDx: previewOcchioDx })}
                      title="Aggiorna i colori mostrati nell'anteprima 3D qui sopra"
                      style={{ marginTop: 10, padding: "6px 16px", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "1px solid #999", background: "#444", color: "#fff", cursor: "pointer" }}
                    >
                      Applica colori all&apos;anteprima
                    </button>
                  </div>
                </div>

                {/* Bottoni sotto */}
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button title="Scarica" onClick={() => window.open(form.modello3D, "_blank")}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>💾</button>
                  <button title="Elimina" onClick={() => setShowDeleteModelloDialog(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14 }}>🗑️</button>
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
              </div>
            )}
          </div>

        </div>
      </div>

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

      {confirmDeleteForma && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina immagine</h2>
            <p className={styles.dialogText}>
              Questa immagine verrà rimossa. Continuare?
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setConfirmDeleteForma(false)}>Annulla</button>
              <button
                className={styles.dialogDeleteBtn}
                onClick={() => { handleDeleteForma(); setConfirmDeleteForma(false); }}
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
