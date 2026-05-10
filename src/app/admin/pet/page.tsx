"use client";

import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getPetCiondolo, savePetCiondolo, PetCiondolo, OcchioPos } from "@/lib/configuratore";
import styles from "@styles/adminAnimale.module.css";

const EMPTY: PetCiondolo = {
  immagineForma: "",
  modello3D: "",
  occhioSxPos: null,
  occhioDxPos: null,
};

export default function AdminPet() {
  const [form, setForm] = useState<PetCiondolo>(EMPTY);
  const [original, setOriginal] = useState<PetCiondolo>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingForma, setUploadingForma] = useState(false);
  const [uploadingModello, setUploadingModello] = useState(false);
  const [showDeleteModelloDialog, setShowDeleteModelloDialog] = useState(false);

  const [sxX, setSxX] = useState("");
  const [sxY, setSxY] = useState("");
  const [sxZ, setSxZ] = useState("");
  const [dxX, setDxX] = useState("");
  const [dxY, setDxY] = useState("");
  const [dxZ, setDxZ] = useState("");

  useEffect(() => {
    getPetCiondolo().then((data) => {
      const f = data || EMPTY;
      setForm(f);
      setOriginal(f);
      if (f.occhioSxPos) {
        setSxX(String(f.occhioSxPos.x));
        setSxY(String(f.occhioSxPos.y));
        setSxZ(String(f.occhioSxPos.z));
      }
      if (f.occhioDxPos) {
        setDxX(String(f.occhioDxPos.x));
        setDxY(String(f.occhioDxPos.y));
        setDxZ(String(f.occhioDxPos.z));
      }
      setLoading(false);
    });
  }, []);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  function update(partial: Partial<PetCiondolo>) {
    setForm(p => ({ ...p, ...partial }));
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
    setForm(p => ({ ...p, modello3D: "", occhioSxPos: null, occhioDxPos: null }));
    setSxX(""); setSxY(""); setSxZ("");
    setDxX(""); setDxY(""); setDxZ("");
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
                  <button title="Elimina" onClick={handleDeleteForma}
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
              <>
                <div className={styles.imgPreview}>
                  <p style={{ fontSize: 12, wordBreak: "break-all", color: "var(--admin-text-muted)", marginBottom: 8 }}>
                    ✓ {decodeURIComponent(form.modello3D.split("/").pop()?.split("?")[0] || "")}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button title="Scarica" onClick={() => window.open(form.modello3D, "_blank")}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>💾</button>
                    <button title="Elimina" onClick={() => setShowDeleteModelloDialog(true)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 8 }}>
                    Posizione occhio sinistro nel viewer 3D
                  </p>
                  <div className={styles.fieldRow}>
                    {[["X", sxX, setSxX, "sx", "x"], ["Y", sxY, setSxY, "sx", "y"], ["Z", sxZ, setSxZ, "sx", "z"]].map(([label, val, setVal, o, c]) => (
                      <div key={String(label)} className={styles.field}>
                        <label className={styles.label}>{label}</label>
                        <input className={styles.input} type="text" inputMode="decimal" value={String(val)}
                          onChange={(e) => handleOcchioChange(e.target.value, setVal as any, o as any, c as any)}
                          placeholder="0.00" />
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 8, marginTop: 12 }}>
                    Posizione occhio destro nel viewer 3D
                  </p>
                  <div className={styles.fieldRow}>
                    {[["X", dxX, setDxX, "dx", "x"], ["Y", dxY, setDxY, "dx", "y"], ["Z", dxZ, setDxZ, "dx", "z"]].map(([label, val, setVal, o, c]) => (
                      <div key={String(label)} className={styles.field}>
                        <label className={styles.label}>{label}</label>
                        <input className={styles.input} type="text" inputMode="decimal" value={String(val)}
                          onChange={(e) => handleOcchioChange(e.target.value, setVal as any, o as any, c as any)}
                          placeholder="0.00" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.uploadArea}>
                <label className={styles.uploadBtn}>
                  {uploadingModello ? "Caricamento..." : "Carica file GLB"}
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
