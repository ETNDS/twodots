import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import Image from "next/image";
import Link from "next/link";
import styles from "@styles/humPetPage.module.css";

export default function HumPetPage() {
  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>

        {/* HERO */}
        <section className={styles.hero}>
          <p className={styles.label}>YOU & PET</p>
          <h1 className={styles.title}>
            Il legame più autentico che hai.<br />
            Era ora che si vedesse.
          </h1>
          <p className={styles.intro}>
            Il tuo animale è parte di te. Ma fuori casa quel legame resta invisibile.
            2dots ha creato il primo bijoux pensato per voi due — insieme.
          </p>
        </section>

        {/* CONCETTO */}
        <section className={styles.sectionDark}>
          <div className={styles.twoCol}>
            <div className={styles.colCard}>
              <div className={styles.cardImg}>
                <Image
                  src="/images/hum-gatto-nero.jpg"
                  alt="Ciondolo YOU"
                  width={180}
                  height={180}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p className={styles.cardTag}>YOU</p>
              <h2 className={styles.cardTitle}>Il tuo ciondolo</h2>
              <p className={styles.cardText}>
                Lo porti tu. Scegli l'animale, il colore della ceramica,
                il tono degli occhi Swarovski, il cordino e una dedica
                personalizzata sul retro.
              </p>
              <p className={styles.cardPrice}>€ 45</p>
            </div>
            <div className={styles.colCard}>
              <div className={styles.cardImg}>
                <Image
                  src="/images/pet-bianco.jpg"
                  alt="Ciondolo PET"
                  width={180}
                  height={180}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p className={styles.cardTag}>PET</p>
              <h2 className={styles.cardTitle}>Il suo ciondolo</h2>
              <p className={styles.cardText}>
                Lo porta il tuo animale, agganciato al collare.
                Stesso stile, stessa palette. Scegli colore, occhi
                e una dedica sul retro.
              </p>
              <p className={styles.cardPrice}>+ € 15 al bundle</p>
            </div>
          </div>
        </section>

        {/* CODICE UNIVOCO */}
        <section className={styles.sectionLight}>
          <div className={styles.centrato}>
            <p className={styles.label}>IL CODICE</p>
            <h2 className={styles.titleDark}>Due oggetti. Un codice. Un legame.</h2>
            <p className={styles.textDark}>
              Ogni coppia YOU + PET viene marchiata con un codice univoco —
              lo stesso su entrambi i ciondoli. Non è un numero di serie.
              È il simbolo che dice: questi due appartengono insieme.
            </p>
          </div>
        </section>

        {/* COME FUNZIONA */}
        <section className={styles.sectionDark}>
          <div className={styles.sectionInner}>
            <div className={styles.titleBox}>
              <p className={styles.labelLight}>COME FUNZIONA</p>
              <h2 className={styles.titleLight}>Costruiscilo su di voi. Su tutti e due.</h2>
            </div>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNum}>01</span>
                <div>
                  <p className={styles.stepTitle}>Configura il tuo YOU</p>
                  <p className={styles.stepText}>Scegli animale, colori, occhi, cordino e dedica.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>02</span>
                <div>
                  <p className={styles.stepTitle}>Aggiungi il PET</p>
                  <p className={styles.stepText}>Scegli colori e occhi per il ciondolo del tuo animale.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>03</span>
                <div>
                  <p className={styles.stepTitle}>Ricevi entrambi</p>
                  <p className={styles.stepText}>Arrivano insieme, con il codice univoco che li unisce.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Inizia dal tuo animale.</h2>
          <p className={styles.ctaText}>
            Scegli il soggetto, configura ogni dettaglio. Il PET lo aggiungi dopo.
          </p>
          <Link href="/configura" className={styles.ctaBtn}>
            Configura il tuo bijoux
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
