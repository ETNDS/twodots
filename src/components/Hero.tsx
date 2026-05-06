import Image from "next/image";
import styles from "@styles/hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <h1 className={styles.tagline}>
          To love<br />
          To shine<br />
          Two Dots
        </h1>
        <p className={styles.sub}>
          Bijoux in ceramica stampata in 3D. Ogni ciondolo porta il disegno
          stilizzato di un animale, con due cristalli Swarovski come occhi.
        </p>
        <button className={styles.cta}>Configura il tuo bijoux</button>
      </div>
      <div className={styles.image}>
        <Image
          src="/images/hum-gatto-nero.jpg"
          alt="Ciondolo gatto"
          width={210}
          height={210}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </section>
  );
}
