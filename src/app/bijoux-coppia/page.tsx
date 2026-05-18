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
                  alt="Ciondolo YOU — da portare al collo"
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
                  alt="Ciondolo PET — da agganciare al collare dell'animale"
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
              Ogni coppia YOU + PET viene marchiata con un codice univoco inciso sul retro.
              Un numero seriale che appartiene solo a voi due.
            </p>
          </div>
        </section>

        {/* MATERIALI */}
        <section className={styles.sectionDark}>
          <div className={styles.centrato}>
            <p className={styles.labelLight}>I MATERIALI</p>
            <h2 className={styles.titleLight}>Resina eco-sostenibile. Swarovski veri.</h2>
            <p className={styles.textLight}>
              Ogni ciondolo è stampato in 3D con resine certificate eco-sostenibili.
              Gli occhi sono cristalli Swarovski originali, montati a mano.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.sectionCta}>
          <Link href="/configura" className={styles.ctaBtn}>
            Configura il tuo bijoux
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
