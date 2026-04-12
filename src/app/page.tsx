import Image from "next/image";
import styles from "@styles/page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <Image
          src="/images/twodots-logo.png"
          alt="TwoDots Logo"
          width={260}
          height={260}
          priority
          className={styles.logo}
        />

        <h1 className={styles.title}>TwoDots</h1>

        <p className={styles.subtitle}>
          Stiamo arrivando.<br/>
          Stiamo ultimando i prototipi per darvi un prodotto non comune e di qualità.
        </p>

        <p className={styles.small}>
          Per informazioni:{" "}
          <a href="mailto:info@twodotsdesign.it">info@twodotsdesign.it</a>
        </p>
      </div>
    </main>
  );
}
