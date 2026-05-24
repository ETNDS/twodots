import Image from "next/image";
import Link from "next/link";
import styles from "@styles/hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <h1 className={styles.tagline}>
          Il tuo animale, da indossare.
        </h1>
        <p className={styles.sub}>
          Un pezzo unico che racconta il legame con il tuo animale.
          Lo configuri tu — soggetto, colori, incisione.
          Lo stesso segno per te e per il tuo pet.
        </p>
        <p className={styles.stats}>
          13 soggetti · 21 colori Swarovski · incisione personalizzata · prodotto su richiesta
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/configura">
            <button className={styles.cta}>Crea il tuo bijoux</button>
          </Link>
          <Link href="/bijoux-coppia" className={styles.ctaSecondary}>
            Scopri You &amp; Pet
          </Link>
        </div>
      </div>
      <div className={styles.image}>
        <Image
          src="/images/hero-main.svg"
          alt="Donna con il suo animale — bijoux 2dots al collo"
          width={400}
          height={500}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </section>
  );
}
