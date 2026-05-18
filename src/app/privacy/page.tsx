import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { CONTACT, SITE } from "@/config/constants";
import styles from "@styles/privacy.module.css";

export const metadata: Metadata = {
  title: "Informativa Privacy",
  description: "Informativa sul trattamento dei dati personali ai sensi del GDPR. Two Dots, Milano.",
  robots: { index: false },
};

export default function Privacy() {
  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>

        <section className={styles.hero}>
          <p className={styles.label}>INFORMATIVA PRIVACY</p>
          <h1 className={styles.title}>Come trattiamo i tuoi dati</h1>
          <p className={styles.intro}>
            Ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003
            come modificato dal D.Lgs. 101/2018.
          </p>
          <p className={styles.updated}>Ultimo aggiornamento: maggio 2026</p>
        </section>

        <section className={styles.content}>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Titolare del trattamento</h2>
            <p className={styles.blockText}>
              Il titolare del trattamento è {SITE.name}, con sede a {SITE.city}.
              Per qualsiasi richiesta relativa alla privacy puoi scrivere a{" "}
              <a href={`mailto:${CONTACT.email}`} className={styles.link}>{CONTACT.email}</a>.
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Dati raccolti e finalità</h2>
            <p className={styles.blockText}>
              Raccogliamo i tuoi dati esclusivamente quando ci contatti
              attraverso il modulo presente nella pagina Contatti.
              I dati raccolti sono: nome, indirizzo email e testo del messaggio.
            </p>
            <p className={styles.blockText}>
              Questi dati vengono utilizzati unicamente per rispondere
              alla tua richiesta. Non vengono condivisi con terze parti,
              non vengono utilizzati per finalità di marketing e non vengono
              ceduti a soggetti esterni.
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Base giuridica</h2>
            <p className={styles.blockText}>
              Il trattamento si basa sul tuo consenso espresso al momento
              dell'invio del modulo di contatto (art. 6, par. 1, lett. a GDPR)
              e sul legittimo interesse del titolare a rispondere
              alle comunicazioni ricevute (art. 6, par. 1, lett. f GDPR).
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Conservazione dei dati</h2>
            <p className={styles.blockText}>
              I dati vengono conservati per il tempo strettamente necessario
              a gestire la tua richiesta e comunque non oltre 12 mesi
              dalla ricezione del messaggio, salvo obblighi di legge.
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Servizi tecnici utilizzati</h2>
            <p className={styles.blockText}>
              Il sito utilizza i seguenti servizi tecnici di terze parti:
            </p>
            <ul className={styles.list}>
              <li><strong>Vercel</strong> — hosting e distribuzione del sito web (USA). Privacy policy: vercel.com/legal/privacy-policy</li>
              <li><strong>Firebase (Google)</strong> — database e archiviazione immagini (UE/USA). Privacy policy: firebase.google.com/support/privacy</li>
              <li><strong>Google Fonts</strong> — caricamento font tipografici (USA). Privacy policy: policies.google.com/privacy</li>
            </ul>
            <p className={styles.blockText}>
              Tutti i fornitori garantiscono adeguate misure di protezione
              dei dati ai sensi del GDPR.
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Cookie</h2>
            <p className={styles.blockText}>
              Questo sito non utilizza cookie di profilazione né cookie
              di terze parti a fini pubblicitari. Vengono utilizzati
              esclusivamente cookie tecnici necessari al funzionamento
              del sito, che non richiedono consenso ai sensi della normativa vigente.
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>I tuoi diritti</h2>
            <p className={styles.blockText}>
              Ai sensi del GDPR hai diritto di accedere ai tuoi dati,
              rettificarli, cancellarli, limitarne il trattamento,
              opporti al trattamento e richiedere la portabilità dei dati.
            </p>
            <p className={styles.blockText}>
              Per esercitare i tuoi diritti scrivi a{" "}
              <a href={`mailto:${CONTACT.email}`} className={styles.link}>{CONTACT.email}</a>.
              Hai inoltre il diritto di proporre reclamo al Garante per
              la protezione dei dati personali (garanteprivacy.it).
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Modifiche</h2>
            <p className={styles.blockText}>
              Questa informativa può essere aggiornata periodicamente.
              La versione aggiornata sarà sempre disponibile su questa pagina
              con l'indicazione della data di ultima modifica.
            </p>
          </div>

        </section>
      </main>
      <Footer />
    </>
  );
}
