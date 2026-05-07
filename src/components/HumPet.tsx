import Link from "next/link";
import Image from "next/image";
import styles from "@styles/humPet.module.css";

export default function HumPet() {
  return (
    <section className={styles.section}>
      <div className={styles.cardUnica}>
        <div className={styles.immagini}>
          <div className={styles.imgCol}>
            <Image src="/images/hum-gatto-nero.jpg" alt="Ciondolo YOU" width={140} height={140} style={{ objectFit: "contain" }} />
            <p className={styles.tag}>YOU</p>
          </div>
          <div className={styles.imgCol}>
            <Image src="/images/pet-bianco.jpg" alt="Ciondolo PET" width={140} height={140} style={{ objectFit: "contain" }} />
            <p className={styles.tag}>PET</p>
          </div>
        </div>
        <div className={styles.testo}>
          <h2 className={styles.titolo}>Una collezione per due.</h2>
          <Link href="/hum-pet" className={styles.scopriBtn}>Scopri →</Link>
        </div>
      </div>
    </section>
  );
}
