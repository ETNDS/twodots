import Image from "next/image";
import styles from "@styles/materialiDettagli.module.css";

const materiali = [
  {
    id: "ceramica",
    titolo: "Ceramica 3D",
    desc: "Resina eco-sostenibile, stampata su richiesta pezzo per pezzo.",
    img: "/images/2dots-materiale-ceramica.svg",
  },
  {
    id: "swarovski",
    titolo: "Cristalli Swarovski",
    desc: "Occhi originali, 21 colori — anche diversi tra loro.",
    img: "/images/2dots-materiale-swarovski.svg",
  },
  {
    id: "smalto",
    titolo: "Smalto",
    desc: "Colora il disegno dell'animale, palette di colori a scelta.",
    img: "/images/2dots-materiale-smalto.svg",
  },
  {
    id: "incisione",
    titolo: "Incisione",
    desc: "Realizzata con pantografo a punta di diamante sul retro.",
    img: "/images/2dots-materiale-incisione.svg",
  },
];

export default function MaterialiDettagli() {
  return (
    <section className={styles.section}>
      <p className={styles.label}>IL PRODOTTO</p>
      <h2 className={styles.title}>Cosa c&apos;è dentro ogni bijoux</h2>
      <div className={styles.grid}>
        {materiali.map((m) => (
          <div key={m.id} className={styles.card}>
            <div className={styles.cardImg}>
              <Image
                src={m.img}
                alt={m.titolo}
                width={300}
                height={200}
                style={{ objectFit: "cover", borderRadius: "8px 8px 0 0" }}
              />
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardTitolo}>{m.titolo}</p>
              <p className={styles.cardDesc}>{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
