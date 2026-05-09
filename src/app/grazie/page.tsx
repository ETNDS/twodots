import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import Link from "next/link";
import styles from "@styles/grazie.module.css";

export default function Grazie() {
  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.content}>
          <p className={styles.label}>ORDINE CONFERMATO</p>
          <h1 className={styles.titolo}>Grazie per il tuo ordine.</h1>
          <p className={styles.testo}>
            Abbiamo ricevuto la tua configurazione e inizieremo a lavorarci presto.
            Riceverai una email di conferma con i dettagli del tuo ordine.
          </p>
          <div className={styles.azioni}>
            <Link href="/collezione" className={styles.btnSecondario}>Esplora la collezione</Link>
            <Link href="/" className={styles.btnPrimario}>Torna alla home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
