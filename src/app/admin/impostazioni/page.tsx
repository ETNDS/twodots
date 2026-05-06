"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@styles/adminAnimale.module.css";

type ImpostazioniForm = {
  prezzoBase: number;
  prezzoPet: number;
  prezzoDedica: number;
};

const EMPTY: ImpostazioniForm = {
  prezzoBase: 45,
  prezzoPet: 15,
  prezzoDedica: 0,
};

export default function AdminImpostazioni() {
  const [form, setForm] = useState<ImpostazioniForm>(EMPTY);
  const [original, setOriginal] = useState<ImpostazioniForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prezzoBaseStr, setPrezzoBaseStr] = useState("45");
  const [prezzoPetStr, setPrezzoPetStr] = useState("15");
  const [prezzoDedicaStr, setPrezzoDedicaStr] = useState("0");

  useEffect(() => {
    async function carica() {
      const snap = await getDoc(doc(db, "configuratore", "impostazioni"));
      if (snap.exists()) {
        const d = snap.data();
        const f: ImpostazioniForm = {
          prezzoBase: d.prezzoBase || 45,
          prezzoPet: d.prezzoPet || 15,
          prezzoDedica: d.prezzoDedica || 0,
        };
        setForm(f);
        setOriginal(f);
        setPrezzoBaseStr(String(d.prezzoBase || 45));
        setPrezzoPetStr(String(d.prezzoPet || 15));
        setPrezzoDedicaStr(String(d.prezzoDedica || 0));
      }
      setLoading(false);
    }
    carica();
  }, []);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  function handleDecimal(raw: string, setStr: (s: string) => void, key: keyof ImpostazioniForm) {
    const normalized = raw.replace(",", ".");
    setStr(raw);
    if (normalized === "" || normalized === ".") { setForm(p => ({ ...p, [key]: 0 })); return; }
    const num = parseFloat(normalized);
    if (!isNaN(num)) setForm(p => ({ ...p, [key]: num }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setDoc(doc(db, "configuratore", "impostazioni"), {
        ...form,
        updatedAt: serverTimestamp(),
      });
      setOriginal(form);
    } catch (e) {
      alert("Errore nel salvataggio.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={styles.loading}>Caricamento...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Impostazioni configuratore</h1>
        <div className={styles.headerActions}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.col}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Prezzi di default</h2>
            <p style={{ fontSize: 12, color: "var(--admin-text-muted)", marginBottom: 16 }}>
              Questi prezzi vengono usati se l'animale non ha un prezzo specifico impostato.
            </p>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Prezzo base HUM (€)</label>
                <input className={styles.input} type="text" inputMode="decimal"
                  value={prezzoBaseStr}
                  onChange={(e) => handleDecimal(e.target.value, setPrezzoBaseStr, "prezzoBase")}
                  placeholder="45" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Prezzo PET (€)</label>
                <input className={styles.input} type="text" inputMode="decimal"
                  value={prezzoPetStr}
                  onChange={(e) => handleDecimal(e.target.value, setPrezzoPetStr, "prezzoPet")}
                  placeholder="15" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Supplemento dedica (€)</label>
                <input className={styles.input} type="text" inputMode="decimal"
                  value={prezzoDedicaStr}
                  onChange={(e) => handleDecimal(e.target.value, setPrezzoDedicaStr, "prezzoDedica")}
                  placeholder="0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
