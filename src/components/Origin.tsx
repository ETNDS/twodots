import styles from "@styles/origin.module.css";

export default function Origin() {
  return (
    <section className={styles.origin}>
      <div className={styles.left}>
        <p className={styles.label}>L'ORIGINE</p>
        <p className={styles.quote}>
          Tutto è partito da una @ scarabocchiata al contrario.
        </p>
      </div>
      <div className={styles.right}>
        <p className={styles.text}>
          Un tratto verticale, due puntini come occhi — così è nata la
          chiocciola, il primo animale 2dots. Da quell'intuizione sono emersi
          oltre 40 soggetti. Ognuno con il suo tratto distintivo. Ognuno con
          i suoi due occhi.
        </p>
      </div>
    </section>
  );
}
