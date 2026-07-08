"use client";

import { useEffect, useState } from "react";
import {
  getFaq, getFaqCategorie, saveFaq, deleteFaq,
  saveFaqCategoria, deleteFaqCategoria,
  Faq, FaqCategoria
} from "@/lib/faq";
import styles from "@styles/adminAnimali.module.css";
import localStyles from "@styles/adminFaq.module.css";

const EMPTY_FAQ: Omit<Faq, "id"> = {
  domanda: "", risposta: "", categoriaSlug: "", ordine: 10, attivo: true,
};

const EMPTY_CAT: Omit<FaqCategoria, "id"> = {
  nome: "", slug: "", ordine: 10, attivo: true,
};

export default function FaqAdmin() {
  const [tab, setTab] = useState<"domande" | "categorie">("domande");
  const [faq, setFaq] = useState<Faq[]>([]);
  const [categorie, setCategorie] = useState<FaqCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; tipo: "faq" | "cat" } | null>(null);
  const [sortKey, setSortKey] = useState<string>("ordine");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function sortIcon(key: string) {
    if (sortKey !== key) return null;
    return <span style={{ opacity: 0.6, fontSize: 10 }}>{sortDir === "asc" ? " ↑" : " ↓"}</span>;
  }

  function sorted<T>(data: T[]): T[] {
    return [...data].sort((a: any, b: any) => {
      const va = a[sortKey]; const vb = b[sortKey];
      if (va == null) return 1; if (vb == null) return -1;
      const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  const [editingFaq, setEditingFaq] = useState<(Faq & { isNew?: boolean }) | null>(null);
  const [editingCat, setEditingCat] = useState<(FaqCategoria & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  async function carica() {
    const [f, c] = await Promise.all([getFaq(), getFaqCategorie()]);
    setFaq(f);
    setCategorie(c);
    setLoading(false);
  }

  useEffect(() => { carica(); }, []);

  // ── FAQ CRUD ──────────────────────────────────────────────────────────────
  async function handleSaveFaq() {
    if (!editingFaq) return;
    if (!editingFaq.domanda.trim() || !editingFaq.risposta.trim()) {
      alert("Domanda e risposta sono obbligatorie.");
      return;
    }
    setSaving(true);
    const { id, isNew, ...data } = editingFaq;
    await saveFaq(isNew ? null : id, data);
    setEditingFaq(null);
    await carica();
    setSaving(false);
  }

  async function handleDeleteFaq(id: string) {
    await deleteFaq(id);
    await carica();
    setConfirmDelete(null);
  }

  // ── CATEGORIE CRUD ────────────────────────────────────────────────────────
  async function handleSaveCat() {
    if (!editingCat) return;
    if (!editingCat.nome.trim() || !editingCat.slug.trim()) {
      alert("Nome e slug sono obbligatori.");
      return;
    }
    setSaving(true);
    const { id, isNew, ...data } = editingCat;
    await saveFaqCategoria(isNew ? null : id, data);
    setEditingCat(null);
    await carica();
    setSaving(false);
  }

  async function handleDeleteCat(id: string) {
    await deleteFaqCategoria(id);
    await carica();
    setConfirmDelete(null);
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>FAQ</h1>
      </div>

      {/* TAB */}
      <div className={localStyles.tabs}>
        <button
          className={`${localStyles.tab} ${tab === "domande" ? localStyles.tabAttivo : ""}`}
          onClick={() => setTab("domande")}
        >
          Domande
        </button>
        <button
          className={`${localStyles.tab} ${tab === "categorie" ? localStyles.tabAttivo : ""}`}
          onClick={() => setTab("categorie")}
        >
          Categorie
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Caricamento...</p>
      ) : tab === "domande" ? (

        // ── DOMANDE ──────────────────────────────────────────────────────────
        <div>
          <div className={styles.toolbar}>
            <span className={styles.count}>{faq.length} domande</span>
            <button className={styles.addBtn} onClick={() => setEditingFaq({ id: "", isNew: true, ...EMPTY_FAQ })}>
              + Nuova domanda
            </button>
          </div>

          <div className={localStyles.grid}>
            <div className={localStyles.gridHeader}>
              <span onClick={() => handleSort("ordine")} style={{ cursor: "pointer", userSelect: "none" }}>Ord{sortIcon("ordine")}</span>
              <span onClick={() => handleSort("categoriaSlug")} style={{ cursor: "pointer", userSelect: "none" }}>Categoria{sortIcon("categoriaSlug")}</span>
              <span onClick={() => handleSort("domanda")} style={{ cursor: "pointer", userSelect: "none" }}>Domanda{sortIcon("domanda")}</span>
              <span>Stato</span>
              <span></span>
            </div>
            {sorted(faq).map(f => (
              <div key={f.id} className={localStyles.gridRow}>
                <span className={localStyles.colOrdine}>{f.ordine}</span>
                <span className={localStyles.colCategoria}>
                  {categorie.find(c => c.slug === f.categoriaSlug)?.nome || f.categoriaSlug}
                </span>
                <span className={localStyles.colDomanda}>{f.domanda}</span>
                <span className={f.attivo ? styles.badgePub : styles.badgeBozza}>
                  {f.attivo ? "Attiva" : "Nascosta"}
                </span>
                <div className={localStyles.colAzioni}>
                  <button className={localStyles.btnEdit} onClick={() => setEditingFaq({ ...f })} title="Modifica">✏️</button>
                  <button className={localStyles.btnDelete} onClick={() => setConfirmDelete({ id: f.id, tipo: "faq" })} title="Elimina">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : (

        // ── CATEGORIE ─────────────────────────────────────────────────────────
        <div>
          <div className={styles.toolbar}>
            <span className={styles.count}>{categorie.length} categorie</span>
            <button className={styles.addBtn} onClick={() => setEditingCat({ id: "", isNew: true, ...EMPTY_CAT })}>
              + Nuova categoria
            </button>
          </div>

          <div className={localStyles.grid}>
            <div className={localStyles.gridHeader}>
              <span onClick={() => handleSort("ordine")} style={{ cursor: "pointer", userSelect: "none" }}>Ord{sortIcon("ordine")}</span>
              <span onClick={() => handleSort("nome")} style={{ cursor: "pointer", userSelect: "none" }}>Nome{sortIcon("nome")}</span>
              <span onClick={() => handleSort("slug")} style={{ cursor: "pointer", userSelect: "none" }}>Codice{sortIcon("slug")}</span>
              <span>Stato</span>
              <span></span>
            </div>
            {sorted(categorie).map(c => (
              <div key={c.id} className={localStyles.gridRow}>
                <span className={localStyles.colOrdine}>{c.ordine}</span>
                <span className={localStyles.colNome}>{c.nome}</span>
                <span className={localStyles.colSlug}>{c.slug}</span>
                <span className={c.attivo ? styles.badgePub : styles.badgeBozza}>
                  {c.attivo ? "Attiva" : "Nascosta"}
                </span>
                <div className={localStyles.colAzioni}>
                  <button className={localStyles.btnEdit} onClick={() => setEditingCat({ ...c })} title="Modifica">✏️</button>
                  <button className={localStyles.btnDelete} onClick={() => setConfirmDelete({ id: c.id, tipo: "cat" })} title="Elimina">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL FAQ ── */}
      {editingFaq && (
        <div className={localStyles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingFaq(null); }}>
          <div className={localStyles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={localStyles.modalTitolo}>{editingFaq.isNew ? "Nuova domanda" : "Modifica domanda"}</h2>

            <div className={localStyles.field}>
              <label className={localStyles.label}>Domanda</label>
              <input className={localStyles.input} type="text"
                value={editingFaq.domanda}
                onChange={e => setEditingFaq(p => ({ ...p!, domanda: e.target.value }))} />
            </div>

            <div className={localStyles.field}>
              <label className={localStyles.label}>Risposta</label>
              <textarea className={localStyles.textarea} rows={5}
                value={editingFaq.risposta}
                onChange={e => setEditingFaq(p => ({ ...p!, risposta: e.target.value }))} />
            </div>

            <div className={localStyles.fieldRow}>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Categoria</label>
                <select className={localStyles.input}
                  value={editingFaq.categoriaSlug}
                  onChange={e => setEditingFaq(p => ({ ...p!, categoriaSlug: e.target.value }))}>
                  <option value="">— Seleziona —</option>
                  {categorie.map(c => (
                    <option key={c.id} value={c.slug}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Ordine</label>
                <input className={localStyles.input} type="number"
                  value={editingFaq.ordine}
                  onChange={e => setEditingFaq(p => ({ ...p!, ordine: Number(e.target.value) }))} />
              </div>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Stato</label>
                <select className={localStyles.input}
                  value={editingFaq.attivo ? "1" : "0"}
                  onChange={e => setEditingFaq(p => ({ ...p!, attivo: e.target.value === "1" }))}>
                  <option value="1">Attiva</option>
                  <option value="0">Nascosta</option>
                </select>
              </div>
            </div>

            <div className={localStyles.modalAzioni}>
              <button className={localStyles.btnAnnulla} onClick={() => setEditingFaq(null)}>Annulla</button>
              <button className={localStyles.btnSalva} onClick={handleSaveFaq} disabled={saving}>
                {saving ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CATEGORIA ── */}
      {editingCat && (
        <div className={localStyles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingCat(null); }}>
          <div className={localStyles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={localStyles.modalTitolo}>{editingCat.isNew ? "Nuova categoria" : "Modifica categoria"}</h2>

            <div className={localStyles.field}>
              <label className={localStyles.label}>Nome</label>
              <input className={localStyles.input} type="text"
                value={editingCat.nome}
                onChange={e => setEditingCat(p => ({ ...p!, nome: e.target.value }))} />
            </div>

            <div className={localStyles.fieldRow}>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Slug</label>
                <input className={localStyles.input} type="text" placeholder="es. prodotto"
                  value={editingCat.slug}
                  onChange={e => setEditingCat(p => ({ ...p!, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} />
              </div>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Ordine</label>
                <input className={localStyles.input} type="number"
                  value={editingCat.ordine}
                  onChange={e => setEditingCat(p => ({ ...p!, ordine: Number(e.target.value) }))} />
              </div>
              <div className={localStyles.field}>
                <label className={localStyles.label}>Stato</label>
                <select className={localStyles.input}
                  value={editingCat.attivo ? "1" : "0"}
                  onChange={e => setEditingCat(p => ({ ...p!, attivo: e.target.value === "1" }))}>
                  <option value="1">Attiva</option>
                  <option value="0">Nascosta</option>
                </select>
              </div>
            </div>

            <div className={localStyles.modalAzioni}>
              <button className={localStyles.btnAnnulla} onClick={() => setEditingCat(null)}>Annulla</button>
              <button className={localStyles.btnSalva} onClick={handleSaveCat} disabled={saving}>
                {saving ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h2 className={styles.dialogTitle}>Elimina elemento</h2>
            <p className={styles.dialogText}>Eliminare questo elemento? L&apos;operazione è irreversibile.</p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancelBtn} onClick={() => setConfirmDelete(null)}>Annulla</button>
              <button className={styles.dialogDeleteBtn} onClick={() => {
                if (confirmDelete.tipo === "faq") handleDeleteFaq(confirmDelete.id);
                else handleDeleteCat(confirmDelete.id);
              }}>Elimina</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
