import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import Image from "next/image";
import Link from "next/link";
import styles from "@styles/humPetPage.module.css";

export const metadata: Metadata = {
  title: "YOU & PET — Il bijoux per te e il tuo animale",
  description:
    "Due ciondoli abbinati: uno per te, uno per il tuo animale. Stesso stile, stessa palette, stesso legame. Bijoux artigianale in ceramica 3D con cristalli Swarovski.",
  openGraph: {
    title: "YOU & PET — Il bijoux per te e il tuo animale",
    description:
      "Due ciondoli abbinati: uno per te, uno per il tuo animale. Stesso stile, stessa palette, stesso legame.",
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
          <p className={styles.label}>YOU & PET</p>
          <h1 className={styles.title}>
            Lo stesso segno, per entrambi.
          </h1>
          <p className={styles.intro}>
            Un bijoux per te, uno per ogni animale che ami. Stesso soggetto, stessa palette,
            stessi cristalli Swarovski. Li configuri insieme — e diventano un unico gesto.
          </p>
        </section>

        {/* CONCETTO */}
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
              <h2 className={styles.cardTitle}>Il tuo ciondolo</h2>
              <p className={styles.cardText}>
                Lo porti tu al collo. Scegli l&apos;animale, il colore della ceramica,
                i cristalli Swarovski, il cordino e una dedica incisa sul retro.
              </p>
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
              <h2 className={styles.cardTitle}>Il suo ciondolo</h2>
              <p className={styles.cardText}>
                Lo porta il tuo animale, agganciato al collare. Stesso soggetto, stessa palette.
                Scegli colore, occhi e dedica sul retro.
                Hai più di un animale? Puoi aggiungere un PET per ognuno.
              </p>
              <p className={styles.cardPrice}>+ € 15 al bundle</p>
            </div>
          </div>
        </section>

        {/* CODICE UNIVOCO */}
        <section className={styles.sectionLight}>
          <div className={styles.centrato}>
            <p className={styles.label}>LA DEDICA</p>
            <h2 className={styles.titleDark}>Ogni pezzo porta le tue parole.</h2>
            <p className={styles.textDark}>
              Una dedica per te e una per ciascun animale.
            </p>
          </div>
        </section>

        {/* MATERIALI */}
        <section className={styles.sectionDark}>
          <div className={styles.centrato}>
            <p className={styles.labelLight}>I MATERIALI</p>
            <h2 className={styles.titleLight}>Resina ecosostenibile. Swarovski originali.</h2>
            <p className={styles.textLight}>
              Ogni ciondolo è in resina ecosostenibile con cristalli Swarovski originali.<br />Prodotto su richiesta, uno per uno.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.sectionCta}>
          <Link href="/configura" className={styles.ctaBtn}>
            Crea il tuo bijoux
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
