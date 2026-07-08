"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFontDedica, deleteFontDedica, FontDedica } from "@/lib/configuratore";
import AdminTable, { ColDef } from "@/components/AdminTable";
import styles from "@styles/adminAnimali.module.css";

const COLUMNS: ColDef<FontDedica>[] = [
  { key: "ordine", label: "Ord", width: "40px", render: (i) => <span style={{ fontSize: 12, opacity: 0.4 }}>{i.ordine}</span> },
  { key: "famiglia", label: "Famiglia", width: "160px", render: (i) => <span style={{ fontFamily: i.famiglia, fontSize: 14, fontWeight: 500 }}>{i.famiglia}</span> },
  { key: "sizePx", label: "Pt", width: "48px", render: (i) => <span style={{ fontSize: 12, opacity: 0.6 }}>{i.sizePx}</span> },
  { key: "nome", label: "Nome", width: "160px", render: (i) => <span className={styles.gridNome}>{i.nome}</span> },
  { key: "descrizione", label: "Descrizione", render: (i) => <span className={styles.gridStoria}>{i.descrizione}</span> },
  { key: "attivo", label: "Stato", width: "100px", render: (i) => <span className={i.attivo ? styles.badgePub : styles.badgeBozza}>{i.attivo ? "Attivo" : "Disabilitato"}</span> },
];

export default function AdminFont() {
  const [items, setItems] = useState<FontDedica[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { getFontDedica().then((data) => { setItems(data); setLoading(false); }); }, []);

  async function handleDelete(item: FontDedica) {
    await deleteFontDedica(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  const filtrati = items.filter(i =>
    i.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    i.famiglia.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}><h1 className={styles.title}>Font dedica</h1></div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input className={styles.filtroInput} type="text" placeholder="Cerca per nome o famiglia..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <span className={styles.count}>{loading ? "..." : `${filtrati.length} font`}</span>
        </div>
        <button className={styles.addBtn} onClick={() => router.push("/admin/font/nuovo")}>+ Nuovo font</button>
      </div>
      <AdminTable columns={COLUMNS} data={filtrati} loading={loading} onEdit={(i) => router.push(`/admin/font/${i.id}`)} onDelete={handleDelete} deleteLabel="font" />
    </div>
  );
}
