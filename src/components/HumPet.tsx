import Image from "next/image";
import styles from "@styles/humPet.module.css";

export default function HumPet() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.label}>HUM &amp; PET</p>
        <h2 className={styles.title}>Due ciondoli, un legame</h2>
        <p className={styles.sub}>
          Per te e per il tuo animale. Marchiati con un codice univoco.
        </p>
      </div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/hum-gatto-nero.jpg"
              alt="Ciondolo HUM"
              width={140}
              height={140}
              style={{ objectFit: "contain" }}
            />
          </div>
          <span className={styles.tag}>HUM</span>
          <h3 className={styles.cardTitle}>Il tuo ciondolo</h3>
          <p className={styles.cardText}>
            Lo porti tu. Scegli l'animale, il colore degli occhi, il cordino
            e un'incisione personalizzata sul retro.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/pet-bianco.jpg"
              alt="Ciondolo PET"
              width={140}
              height={140}
              style={{ objectFit: "contain" }}
            />
          </div>
          <span className={styles.tag}>PET</span>
          <h3 className={styles.cardTitle}>Il suo ciondolo</h3>
          <p className={styles.cardText}>
            Lo porta il tuo animale. Stesso codice, stesso legame.
            Si aggancia al collare.
          </p>
        </div>
      </div>
    </section>
  );
}
