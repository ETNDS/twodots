import Link from "next/link";
import styles from "@styles/configurator.module.css";

const steps = [
  { num: "01", name: "Animale", desc: "Scegli tra 13 soggetti stilizzati" },
  { num: "02", name: "Colore resina ceramica", desc: "Nero o bianco" },
  { num: "03", name: "Smalto", desc: "Il colore del disegno dell'animale" },
  { num: "04", name: "Swarovski", desc: "21 colori per gli occhi — anche diversi tra loro" },
  { num: "05", name: "Cordino", desc: "Uno nero, uno nel colore che preferisci — 10 tinte in materiale riciclato" },
  { num: "06", name: "Dedica", desc: "Incisione a punta di diamante sul retro" },
  { num: "07", name: "Bijoux PET", desc: "Opzionale — coordinato per il tuo animale" },
  { num: "08", name: "Confezione", desc: "Sacchetto in cotone o scatola in cartoncino" },
];

export default function Configurator() {
  return (
    <section className={styles.section}>
      <p className={styles.label}>COME FUNZIONA</p>
      <h2 className={styles.title}>Ogni dettaglio è una tua creazione</h2>
      <p className={styles.sub}>Tu scegli i dettagli del tuo bijoux. Noi lo realizziamo su misura.</p>
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
        <Link href="/configura">
          <button className={styles.btn}>Crea il tuo bijoux</button>
        </Link>
      </div>
    </section>
  );
}
