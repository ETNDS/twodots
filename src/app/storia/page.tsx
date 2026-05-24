import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { CONTACT } from "@/config/constants";
import Image from "next/image";
import styles from "@styles/ilProgetto.module.css";

export const metadata: Metadata = {
  title: "Il progetto — La storia di Two Dots",
  description:
    "Two Dots nasce da uno scarabocchio. Bijoux artigianali in ceramica stampata in 3D con cristalli Swarovski, prodotti a Milano. La storia, la filosofia e i materiali.",
  openGraph: {
    title: "Il progetto — La storia di Two Dots",
    description:
      "Two Dots nasce da uno scarabocchio. Bijoux artigianali in ceramica 3D con Swarovski, prodotti a Milano.",
    url: "https://www.twodotsmilano.it/storia",
  },
};

export default function IlProgetto() {
  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>

        {/* HERO */}
        <section className={styles.hero}>
          <p className={styles.label}>IL PROGETTO</p>
          <h1 className={styles.title}>Non stavo pensando a un bijoux.</h1>
          <p className={styles.intro}>
            Stavo lavorando a un software. Carta, penna, mente altrove.
            E sul foglio è apparsa una @ al contrario — un tratto verticale, due puntini come occhi. Una chiocciola.
          </p>
        </section>

        {/* ORIGINE */}
        <section className={styles.sectionDark}>
          <div className={styles.sectionInner}>
            <div>
              <div className={styles.titleBox}>
                <p className={styles.labelLight}>L'ORIGINE</p>
                <h2 className={styles.titleLight}>Una @ scarabocchiata, l&apos;intuizione di TwoDots.</h2>
              </div>
            </div>
            <div>
              <div className={styles.storiaImg} style={{ overflow: "hidden" }}>
                <Image
                  src="/images/2dots-storia-processo.svg"
                  alt="Processo creativo TwoDots — schizzo a mano"
                  width={260}
                  height={174}
                  style={{ objectFit: "cover", borderRadius: "8px", maxWidth: "260px", width: "auto", height: "auto", float: "right", marginLeft: "20px", marginBottom: "12px" }}
                />
              </div>
              <p className={styles.textDarkOnLight}>
                Anni fa, mentre ragionavo su un problema di sviluppo software, ho scarabocchiato una @ al contrario.
                Un tratto lungo, due puntini — e sul foglio c&apos;era una chiocciola. Non l&apos;avevo disegnata consapevolmente. Era lì.
              </p>
              <p className={styles.textDarkOnLight} style={{ marginTop: "16px" }}>
                Ho continuato a disegnare. Sono venuti fuori altri animali — ognuno con il suo tratto essenziale,
                ognuno con i suoi due occhi. A un certo punto erano più di 30. Di questi, 13 sono già in produzione. Gli altri seguiranno — ognuno ha i suoi tempi, dal disegno al ciondolo finito.
              </p>
            </div>
          </div>
        </section>

        {/* FILOSOFIA */}
        <section className={styles.sectionLight}>
          <div className={styles.sectionInner}>
            <div>
              <p className={styles.label}>LA FILOSOFIA</p>
              <h2 className={styles.titleDark}>Una linea. Due punti. Il resto lo immagini tu.</h2>
            </div>
            <div>
              <p className={styles.textDark}>
                Vengo dall&apos;informatica. Penso per strutture essenziali. Per me un disegno funziona
                quando togli tutto il superfluo e rimane ancora qualcosa di riconoscibile.
                È lo stesso principio di un buon codice.
              </p>
              <p className={styles.textDark} style={{ marginTop: "16px" }}>
                Ogni animale TwoDots ha una linea e due occhi. Non di più.
                L&apos;animale lo riconosci tu — e con lui arriva quello che ti fa sentire.
              </p>
              <p className={styles.textDark} style={{ marginTop: "16px" }}>
                Non è un gadget. Non è un charm generico con la zampa.
                È un oggetto che dice qualcosa di preciso — su di te, sul tuo animale, sul legame tra voi.
              </p>
            </div>
          </div>
        </section>

        {/* IL PERCORSO */}
        <section className={styles.sectionDark}>
          <div className={styles.sectionInner}>
            <div>
              <div className={styles.titleBox}>
                <p className={styles.labelLight}>IL PERCORSO</p>
                <h2 className={styles.titleLight}>Plexiglass, ebano, galalite. Poi la resina.</h2>
              </div>
            </div>
            <div>
              <p className={styles.textDarkOnLight}>
                Prima di arrivare alla resina ceramica ecosostenibile ho provato diversi altri materiali:
                plexiglass, plexi ecosostenibile, galalite, ebano. Ognuno aveva qualcosa che non andava —
                nella resa, nella lavorazione, nella coerenza col design.
              </p>
              <div className={styles.storiaImg} style={{ overflow: "hidden" }}>
                <Image
                  src="/images/2dots-storia-incisione.svg"
                  alt="Incisione a punta di diamante sul retro del ciondolo"
                  width={260}
                  height={174}
                  style={{ objectFit: "cover", borderRadius: "8px", maxWidth: "260px", width: "auto", height: "auto", float: "right", marginLeft: "20px", marginBottom: "12px" }}
                />
              </div>
              <p className={styles.textDarkOnLight} style={{ marginTop: "16px" }}>
                La resina ceramica è arrivata per ultima. È quella che restituisce meglio la forma,
                che tiene l&apos;incisione, che si presta alla stampa 3D pezzo per pezzo.
                Non è stata la scelta più semplice — è stata quella giusta.
              </p>
            </div>
          </div>
        </section>

        {/* MATERIALI */}
        <section className={styles.sectionDark}>
          <div className={styles.sectionInner}>
            <div>
              <p className={styles.label}>I MATERIALI</p>
              <h2 className={styles.titleDark}>Costruito per durare. Come certi legami.</h2>
            </div>
            <div className={styles.materialsGrid}>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Ceramica 3D</p>
                <p className={styles.materialText}>
                  Resina ecosostenibile, stampata su richiesta pezzo per pezzo. Non prodotta in serie.
                </p>
              </div>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Cristalli Swarovski</p>
                <p className={styles.materialText}>
                  Occhi originali, 21 colori — anche diversi tra loro.
                </p>
              </div>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Incisione</p>
                <p className={styles.materialText}>
                  Pantografo a punta di diamante sul retro. Un testo, una data, un nome.
                </p>
              </div>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Cordino</p>
                <p className={styles.materialText}>
                  Materiale riciclato. Uno nero fisso, uno nel colore che preferisci — 10 tinte disponibili.
                </p>
              </div>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Packaging</p>
                <p className={styles.materialText}>
                  Scatola in cartoncino o sacchetto in cotone. Già pronto per essere un regalo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CHI SIAMO */}
        <section className={styles.sectionLight}>
          <div className={styles.sectionInnerCentered}>
            <p className={styles.label}>CHI SIAMO</p>
            <h2 className={styles.titleDark}>Un progetto nato per caso, portato avanti in famiglia.</h2>
            <div className={styles.storiaImg} style={{ overflow: "hidden" }}>
              <Image
                src="/images/2dots-storia-fondatore.svg"
                alt="Il fondatore di TwoDots"
                width={600}
                height={400}
                style={{ objectFit: "cover", borderRadius: "8px", maxWidth: "260px", width: "auto", height: "auto", float: "right", marginLeft: "20px", marginBottom: "12px" }}
              />
            </div>
            <p className={styles.textDarkCentered}>
              Sono un informatico con una tendenza a creare cose che non c&apos;entrano con il software. TwoDots è una di queste.
            </p>
            <p className={styles.textDarkCentered} style={{ marginTop: "16px" }}>
              Da anni mi aiutano le mie due figlie: Beatrice cura i disegni e i modelli 3D —
              è lei che trasforma gli schizzi in ciondoli. Carolina si occupa della scrittura
              e dell&apos;impostazione — è lei che dà voce al progetto.
            </p>
            <p className={styles.textDarkCentered} style={{ marginTop: "16px" }}>
              Se vuoi sapere qualcosa, proporre un animale, o semplicemente curiosare — scrivici.
            </p>
            <a href={`mailto:${CONTACT.email}`} className={styles.emailLink}>
              {CONTACT.email}
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
