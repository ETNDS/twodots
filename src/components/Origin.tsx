import Link from "next/link";
import styles from "@styles/origin.module.css";

export default function Origin() {
  return (
    <section className={styles.origin}>
      <div className={styles.left}>
        <p className={styles.label}>IL PROGETTO</p>
        <p className={styles.quote}>
          Tutto è partito da una @ scarabocchiata al contrario.
        </p>
      </div>
      <div className={styles.right}>
        <p className={styles.text}>
          Un tratto verticale, due puntini come occhi — così è nata la
          chiocciola, il primo animale 2dots. Da quell&apos;intuizione sono emersi
          oltre 40 soggetti. Ognuno con il suo tratto. Ognuno con i suoi due occhi.
        </p>
        <p className={styles.text} style={{ marginTop: "12px" }}>
          Il resto lo fai tu. Ogni disegno è volutamente essenziale — è chi guarda
          a riconoscere l&apos;animale e a sentire quello che suscita.
        </p>
        <Link href="/storia" className={styles.link}>
          Leggi la storia del progetto →
        </Link>
      </div>
    </section>
  );
}
