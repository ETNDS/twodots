import styles from "@styles/configurator.module.css";

const steps = [
  {
    num: "01",
    name: "Animale",
    desc: "Scegli il soggetto tra oltre 40 disegni stilizzati",
  },
  {
    num: "02",
    name: "Colore ceramica",
    desc: "Nero o bianco",
  },
  {
    num: "03",
    name: "Swarovski",
    desc: "16 colori — anche diversi tra loro",
  },
  {
    num: "04",
    name: "Incisione",
    desc: "Un testo personalizzato sul retro",
  },
];

export default function Configurator() {
  return (
    <section className={styles.section}>
      <p className={styles.label}>COME FUNZIONA</p>
      <h2 className={styles.title}>Quattro scelte, un pezzo unico</h2>
      <p className={styles.sub}>Configuri tu, stampiamo noi. Ogni bijoux è prodotto su richiesta.</p>
      <div className={styles.grid}>
        {steps.map((step) => (
          <div key={step.num} className={styles.step}>
            <p className={styles.num}>{step.num}</p>
            <p className={styles.name}>{step.name}</p>
            <p className={styles.desc}>{step.desc}</p>
          </div>
        ))}
      </div>
      <div className={styles.cta}>
        <button className={styles.btn}>Inizia a configurare</button>
      </div>
    </section>
  );
}
