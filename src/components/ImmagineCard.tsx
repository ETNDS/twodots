"use client";

import { useState } from "react";
import styles from "@styles/adminAnimale.module.css";

type Props = {
  url: string;
  index: number;
  altText?: string;
  onElimina: (url: string) => void;
  onPrincipale?: (url: string) => void;
  showPrincipale?: boolean;
};

export default function ImmagineCard({ url, index, altText, onElimina, onPrincipale, showPrincipale = true }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={styles.ciondoloImg}>
      {showPrincipale && index === 0 && (
        <span style={{ fontSize: 9, background: "var(--admin-sidebar)", color: "var(--admin-sidebar-text)", padding: "2px 6px", borderRadius: 4, marginBottom: 4, display: "inline-block" }}>
          Principale
        </span>
      )}
      <img src={url} alt={altText || `Immagine ${index + 1}`} />
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 4 }}>
        {showPrincipale && index > 0 && onPrincipale && (
          <button
            title="Imposta come principale"
            style={{ fontSize: 10, color: "var(--admin-sidebar)", background: "var(--admin-bg)", border: "0.5px solid var(--admin-border)", padding: "3px 8px", borderRadius: 6, cursor: "pointer" }}
            onClick={() => onPrincipale(url)}
          >
            Principale
          </button>
        )}
        <button
          title="Scarica"
          onClick={() => window.open(url, "_blank")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14, lineHeight: 1 }}
        >
          💾
        </button>
        <button
          title="Elimina"
          onClick={() => setConfirmDelete(true)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--admin-text-muted)", fontSize: 14, lineHeight: 1 }}
        >
          🗑️
        </button>
      </div>

      {confirmDelete && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina immagine</h2>
            <p className={styles.dialogText}>
              Questa immagine verrà rimossa. Continuare?
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setConfirmDelete(false)}>Annulla</button>
              <button
                className={styles.dialogDeleteBtn}
                onClick={() => { onElimina(url); setConfirmDelete(false); }}
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
