"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTuttiAnimali, Animale } from "@/lib/animali";
import { deleteAnimale } from "@/lib/configuratore";
import AdminTable, { ColDef } from "@/components/AdminTable";
import styles from "@styles/adminAnimali.module.css";

const COLUMNS: ColDef<Animale>[] = [
  { key: "ordine", label: "Ord", width: "40px", render: (i) => <span style={{ fontSize: 12, opacity: 0.4 }}>{i.ordine}</span> },
  {
    key: "immagineDisegno", label: "", width: "48px", sortable: false,
    render: (i) => (
      <div className={styles.gridImg}>
        {i.immagineDisegno ? <img src={i.immagineDisegno} alt={i.nome} /> : <span>{i.nome[0]}</span>}
      </div>
    ),
  },
  { key: "nome", label: "Nome", width: "180px", render: (i) => <span className={styles.gridNome}>{i.nome}</span> },
  { key: "storia", label: "Storia", render: (i) => <span className={styles.gridStoria}>{i.storia}</span> },
  { key: "pubblicato", label: "Stato", width: "100px", render: (i) => <span className={i.pubblicato ? styles.badgePub : styles.badgeBozza}>{i.pubblicato ? "Pubblicato" : "Bozza"}</span> },
];

export default function AdminAnimali() {
  const [items, setItems] = useState<Animale[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { getTuttiAnimali().then((data) => { setItems(data); setLoading(false); }); }, []);

  async function handleDelete(item: Animale) {
    await deleteAnimale(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  const filtrati = items
    .filter(i => i.nome.toLowerCase().includes(filtro.toLowerCase()))
    .sort((a, b) => (a.ordine ?? 999) - (b.ordine ?? 999));

  return (
    <div>
      <div className={styles.header}><h1 className={styles.title}>Animali</h1></div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <input className={styles.filtroInput} type="text" placeholder="Cerca per nome..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          <span className={styles.count}>{loading ? "..." : `${filtrati.length} animali`}</span>
        </div>
        <button className={styles.addBtn} onClick={() => router.push("/admin/animale/nuovo")}>+ Nuovo animale</button>
      </div>
      <AdminTable columns={COLUMNS} data={filtrati} loading={loading} onEdit={(i) => router.push(`/admin/animale/${i.id}`)} onDelete={handleDelete} deleteLabel="animale" />
    </div>
  );
}
