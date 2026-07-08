"use client";

import { useState } from "react";
import styles from "@styles/adminAnimali.module.css";

export type ColDef<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render: (item: T) => React.ReactNode;
};

type Props<T extends { id: string; nome?: string }> = {
  columns: ColDef<T>[];
  data: T[];
  loading?: boolean;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  deleteLabel?: string;
};

export default function AdminTable<T extends { id: string; nome?: string }>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  deleteLabel = "elemento",
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const col = columns.find(c => c.key === sortKey);
        if (!col) return 0;
        // Recupera il valore raw dall'oggetto tramite key
        const va = (a as any)[sortKey];
        const vb = (b as any)[sortKey];
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  const gridCols = [...columns.map(c => c.width ?? "1fr"), "80px"].join(" ");

  if (loading) return <p className={styles.loading}>Caricamento...</p>;

  return (
    <>
      <div className={styles.grid}>
        {/* Header */}
        <div className={styles.gridHeader} style={{ gridTemplateColumns: gridCols }}>
          {columns.map(col => (
            <span
              key={col.key}
              onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
              style={{
                cursor: col.sortable !== false ? "pointer" : "default",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {col.label}
              {sortKey === col.key && (
                <span style={{ opacity: 0.6, fontSize: 10 }}>
                  {sortDir === "asc" ? "↑" : "↓"}
                </span>
              )}
            </span>
          ))}
          <span></span>
        </div>

        {/* Righe */}
        {sorted.map(item => (
          <div
            key={item.id}
            className={styles.gridRow}
            style={{ gridTemplateColumns: gridCols }}
            onClick={() => onEdit(item)}
          >
            {columns.map(col => (
              <div key={col.key}>{col.render(item)}</div>
            ))}
            <div className={styles.gridAzioni} onClick={e => e.stopPropagation()}>
              <button
                className={styles.btnEdit}
                onClick={() => onEdit(item)}
                title="Modifica"
              >✏️</button>
              <button
                className={styles.btnDelete}
                onClick={() => setConfirmDelete(item)}
                title="Elimina"
              >🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog conferma */}
      {confirmDelete && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina {deleteLabel}</h2>
            <p className={styles.dialogText}>
              Eliminare <strong>{confirmDelete.nome ?? "questo elemento"}</strong>?
              L&apos;operazione è irreversibile.
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setConfirmDelete(null)}>
                Annulla
              </button>
              <button
                className={styles.dialogDeleteBtn}
                onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
