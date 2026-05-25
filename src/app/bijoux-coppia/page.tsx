import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import Image from "next/image";
import Link from "next/link";
import styles from "@styles/humPetPage.module.css";

export const metadata: Metadata = {
  title: "YOU & PET — Il set coordinato per te e per il tuo animale",
  description:
    "Un bijoux da indossare e un ciondolo da agganciare al collare. Stesso soggetto, stessa palette, stesso legame. Bijoux artigianale in ceramica 3D con cristalli Swarovski.",
  openGraph: {
    title: "YOU & PET — Il set coordinato per te e per il tuo animale",
    description:
      "Un bijoux da indossare e un ciondolo da agganciare al collare. Stesso soggetto, stessa palette, stesso legame.",
    url: "https://www.twodotsmilano.it/bijoux-coppia",
  },
};

export default function HumPetPage() {
  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>

        {/* HERO */}
        <section className={styles.hero}>
          <p className={styles.label}>YOU &amp; PET</p>
          <h1 className={styles.title}>Il set coordinato per te e per il tuo pet</h1>
          <p className={styles.intro}>
            Un bijoux da indossare e un ciondolo da agganciare al collare: due pezzi che parlano
            la stessa lingua e raccontano lo stesso legame. Ogni set prende forma attraverso scelte
            personali: il soggetto, la palette, i punti luce, l&apos;incisione. Il risultato non è
            un accessorio generico, ma un segno condiviso, costruito intorno a voi due.
          </p>
          <div className={styles.heroCta}>
            <Link href="/configura">
              <button className={styles.btnPrimary}>Crea il tuo set</button>
            </Link>
            <Link href="/contatti">
              <button className={styles.btnSecondary}>Hai bisogno di aiuto nella scelta?</button>
            </Link>
          </div>
        </section>

        {/* INTRO SET */}
        <section className={styles.sectionLight}>
          <div className={styles.sectionInner}>
            <div>
              <h2 className={styles.titleDark}>Un unico progetto, in due versioni</h2>
            </div>
            <div>
              <p className={styles.textDark}>
                Il set è pensato per chi vuole portare con sé il proprio animale in una forma
                elegante e riconoscibile. Tu indossi il bijoux, il tuo pet porta il ciondolo
                coordinato sul collare: stesso soggetto, stessa intenzione, due modi diversi di
                raccontare la stessa storia.
              </p>
            </div>
          </div>
        </section>

        {/* BLOCCHI YOU / PET */}
        <section className={styles.sectionDark}>
          <div className={styles.twoCol}>

            <div className={styles.colCard}>
              <div className={styles.cardImg}>
                <Image
                  src="/images/2dots-you.svg"
                  alt="Ciondolo YOU 2dots — da portare al collo"
                  width={180}
                  height={180}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p className={styles.cardTag}>YOU</p>
              <h2 className={styles.cardTitle}>Il bijoux da indossare ogni giorno</h2>
              <p className={styles.cardText}>
                Leggero, essenziale, facile da abbinare. Il soggetto riprende il profilo stilizzato
                del tuo animale, completato con i due punti luce Swarovski. Sul retro puoi aggiungere
                un&apos;incisione che lo renda ancora più tuo.
              </p>
              <p className={styles.cardClaim}>Un segno discreto, ma immediatamente riconoscibile.</p>
              <p className={styles.cardPrice}>€ 45</p>
            </div>

            <div className={styles.colCard}>
              <div className={styles.cardImg}>
                <Image
                  src="/images/2dots-pet.svg"
                  alt="Ciondolo PET 2dots — da agganciare al collare"
                  width={180}
                  height={180}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p className={styles.cardTag}>PET</p>
              <h2 className={styles.cardTitle}>Il ciondolo coordinato per il collare</h2>
              <p className={styles.cardText}>
                Lo porta il tuo animale, agganciato al collare. Stesso soggetto, stessa palette.
                Puoi personalizzarlo nei dettagli e aggiungere una dedica sul retro.
              </p>
              <p className={styles.cardClaim}><strong>È disponibile in tre misure, per adattarsi meglio alla taglia del tuo animale.</strong></p>
              <p className={styles.cardText}>
                Hai più di un animale? Puoi aggiungere un PET per ognuno.
              </p>
              <p className={styles.cardPrice}>+ € 15 al bundle</p>
            </div>

          </div>
        </section>

        {/* SCEGLI OGNI DETTAGLIO */}
        <section className={styles.sectionLight}>
          <div className={styles.bloccoDettagli}>
            <p className={styles.label}>LA CONFIGURAZIONE</p>
            <h2 className={styles.titleDark}>Scegli ogni dettaglio</h2>
            <p className={styles.textDark} style={{ marginBottom: 12 }}>
              Ogni set prende forma attraverso queste scelte:
            </p>
            <ul className={styles.listaDettagli}>
              <li>Il soggetto del tuo animale</li>
              <li>Il colore della ceramica</li>
              <li>Il colore dei punti luce Swarovski</li>
              <li>L&apos;incisione sul retro — un nome, una data, delle iniziali, una parola che ha senso solo per voi</li>
              <li>La misura del PET: piccola, media o grande</li>
            </ul>
          </div>
        </section>

        {/* MATERIALI */}
        <section className={styles.sectionMid}>
          <div className={styles.centrato}>
            <p className={styles.label}>I MATERIALI</p>
            <p className={styles.textDark}>
              Resina ecosostenibile per leggerezza e definizione del tratto. Cristalli Swarovski
              originali per dare presenza agli occhi. Ogni pezzo viene realizzato su richiesta,
              così da mantenere coerenza con le scelte di personalizzazione.
            </p>
          </div>
        </section>

        {/* LA DEDICA */}
        <section className={styles.sectionLight}>
          <div className={styles.centrato}>
            <p className={styles.label}>LA DEDICA</p>
            <h2 className={styles.titleDark}>Ogni pezzo può custodire le tue parole.</h2>
            <p className={styles.textDark}>
              Una dedica per te e una per ciascun animale. Un nome, una data, delle iniziali,
              una parola che ha senso solo per voi — incisa a punta di diamante sul retro di ogni pezzo.
            </p>
          </div>
        </section>

        {/* PER CHI È */}
        <section className={styles.sectionMid}>
          <div className={styles.centrato}>
            <p className={styles.label}>PER CHI È</p>
            <h2 className={styles.titleDark}>Per chi cerca qualcosa che vi rappresenti davvero</h2>
            <p className={styles.textDark}>
              Per chi sente il proprio animale come parte della propria identità quotidiana e cerca
              un modo elegante per esprimere quel legame. Non un accessorio generico, ma qualcosa
              di personale e coerente con il proprio stile.
            </p>
            <p className={styles.textDark} style={{ marginTop: 12 }}>
              Funziona bene anche come regalo: un oggetto che ha significato, ma che resta bello
              da vedere e da indossare.
            </p>
          </div>
        </section>

        {/* CHIUSURA */}
        <section className={styles.sectionCta}>
          <h2 className={styles.ctaTitolo}>Create il vostro segno condiviso.</h2>
          <p className={styles.ctaSub}>
            Un bijoux per te, un ciondolo per il suo collare, lo stesso soggetto in due forme.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/configura">
              <button className={styles.btnPrimary}>Crea il tuo set</button>
            </Link>
            <Link href="/contatti">
              <button className={styles.btnSecondary}>Non trovi il tuo animale? Scrivici</button>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
