import Link from "next/link";
import Image from "next/image";
import styles from "@styles/humPet.module.css";

export default function HumPet() {
  return (
    <section className={styles.section}>
      <div className={styles.cardUnica}>
        <div className={styles.immagini}>
          <div className={styles.imgCol}>
            <Image src="/images/2dots-you.svg" alt="Ciondolo YOU 2dots — da portare al collo" width={140} height={140} style={{ objectFit: "contain" }} />
            <p className={styles.tag}>YOU</p>
          </div>
          <div className={styles.separatore}>+</div>
          <div className={styles.imgCol}>
            <Image src="/images/2dots-pet.svg" alt="Ciondolo PET 2dots — da agganciare al collare" width={140} height={140} style={{ objectFit: "contain" }} />
            <p className={styles.tag}>PET</p>
          </div>
        </div>
        <div className={styles.testo}>
          <p className={styles.label}>YOU &amp; PET</p>
          <h2 className={styles.titolo}>
            Lo stesso segno, per entrambi.
          </h2>
          <p className={styles.descrizione}>
            Un bijoux per te, uno per il tuo animale. Stesso soggetto, stessa palette,
            stessi cristalli Swarovski. Li configuri insieme — e diventano un unico gesto.
            Prodotti su richiesta, uno per uno.
          </p>
          <Link href="/bijoux-coppia" className={styles.scopriBtn}>
            Scopri come funziona →
          </Link>
        </div>
      </div>
    </section>
  );
}
