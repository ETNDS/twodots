"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSmalti, deleteSmalto, ItemColore } from "@/lib/configuratore";
import AdminTable, { ColDef } from "@/components/AdminTable";
import styles from "@styles/adminAnimali.module.css";

const COLUMNS: ColDef<ItemColore>[] = [
  { key: "ordine", label: "Ord", width: "40px", render: (i) => <span style={{ fontSize: 12, opacity: 0.4 }}>{i.ordine}</span> },
  {
    key: "coloreCSS", label: "", width: "48px", sortable: false,
    render: (i) => (
      <div className={styles.gridImg}>
        {i.immagini?.[0] ? <img src={i.immagini[0]} alt={i.nome} /> : <div style={{ width: 28, height: 28, borderRadius: "50%", background: i.coloreCSS, border: "1px solid rgba(0,0,0,0.1)" }} />}
      </div>
    ),
  },
  { key: "nome", label: "Nome", width: "180px", render: (i) => <span className={styles.gridNome}>{i.nome}</span> },
  { key: "descrizione", label: "Descrizione", render: (i) => <span className={styles.gridStoria}>{i.descrizione}</span> },
  { key: "attivo", label: "Stato", width: "100px", render: (i) => <span className={i.attivo ? styles.badgePub : styles.badgeBozza}>{i.attivo ? "Attivo" : "Disabilitato"}</span> },
];

export default function Page() {
  const [items, setItems] = useState<ItemColore[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { getSmalti().then((data) => { setItems(data); setLoading(false); }); }, []);

  async function handleDelete(item: ItemColore) {
    await deleteSmalto(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  const filtrati = items.filter(i => i.nome.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <div>
      <div className={styles.header}><h1 className={styles.title}>Smalti</h1></div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input className={styles.filtroInput} type="text" placeholder="Cerca per nome..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <span className={styles.count}>{loading ? "..." : `${filtrati.length} smalti`}</span>
        </div>
        <button className={styles.addBtn} onClick={() => router.push("/admin/smalti/nuovo")}>+ Nuovo smalto</button>
      </div>
      <AdminTable columns={COLUMNS} data={filtrati} loading={loading} onEdit={(i) => router.push(`/admin/smalti/${i.id}`)} onDelete={handleDelete} deleteLabel="smalto" />
    </div>
  );
}
