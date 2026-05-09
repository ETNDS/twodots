import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { CONTACT } from "@/config/constants";
import styles from "@styles/ilProgetto.module.css";

export default function IlProgetto() {
  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>

        {/* HERO */}
        <section className={styles.hero}>
          <p className={styles.label}>IL PROGETTO</p>
          <h1 className={styles.title}>La semplicità racconta storie straordinarie.</h1>
          <p className={styles.intro}>
            2dots nasce da uno scarabocchio. Cresce con ogni animale che aggiungiamo.
            Esiste perché il legame con il tuo animale merita di essere visto.
          </p>
        </section>

        {/* ORIGINE */}
        <section className={styles.sectionDark}>
          <div className={styles.sectionInner}>
            <div>
              <div className={styles.titleBox}>
                <p className={styles.labelLight}>L'ORIGINE</p>
                <h2 className={styles.titleLight}>Una @ scarabocchiata al contrario.</h2>
              </div>
            </div>
            <div>
              <p className={styles.textDarkOnLight}>
                L'inizio è stato casuale. Una @ disegnata al contrario, un tratto verticale lungo,
                due puntini come occhi — ed è nata la chiocciola. Il primo animale 2dots.
              </p>
              <p className={styles.textDarkOnLight} style={{ marginTop: "16px" }}>
                Da quella intuizione sono emersi oltre 40 soggetti. La balena, la formica,
                il gatto, il cane, la coccinella. Ognuno con il suo tratto inconfondibile.
                Ognuno con i suoi due occhi.
              </p>
              <p className={styles.textDarkOnLight} style={{ marginTop: "16px" }}>
                A chi osserva il compito di riconoscere l'animale — e far emergere
                le emozioni che suscita.
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
                Ogni ciondolo 2dots cattura l'essenza di un animale attraverso tre elementi:
                una linea semplice che disegna la silhouette, due cristalli Swarovski come occhi
                — spesso in posizioni inusuali — e un design minimalista che coglie
                la caratteristica inconfondibile di quell'animale specifico.
              </p>
              <p className={styles.textDark} style={{ marginTop: "16px" }}>
                Non è un gadget. Non è un charm generico con la zampa.
                È un oggetto che dice qualcosa di preciso — su di te, sul tuo animale,
                sul legame tra voi.
              </p>
            </div>
          </div>
        </section>

        {/* MATERIALI */}
        <section className={styles.sectionDark}>
          <div className={styles.sectionInner}>
            <div>
              <div className={styles.titleBox}>
                <p className={styles.labelLight}>I MATERIALI</p>
                <h2 className={styles.titleLight}>Costruito per durare. Come certi legami.</h2>
              </div>
            </div>
            <div className={styles.materialsGrid}>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Ceramica 3D</p>
                <p className={styles.materialText}>
                  Ogni ciondolo è stampato in resina ceramica ecosostenibile.
                  Costruito pezzo per pezzo, non prodotto in serie.
                </p>
              </div>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Cristalli Swarovski</p>
                <p className={styles.materialText}>
                  Gli occhi sono cristalli Swarovski originali. Puoi scegliere
                  16 colori diversi — anche uno per occhio.
                </p>
              </div>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Cordino riciclato</p>
                <p className={styles.materialText}>
                  Il cordino è in materiale riciclato. Nero fisso con un secondo
                  cordino colorato a scelta. Lunghezza regolabile con nodo.
                </p>
              </div>
              <div className={styles.materialCard}>
                <p className={styles.materialTitle}>Packaging sostenibile</p>
                <p className={styles.materialText}>
                  Sacchetto in cotone o scatola in cartone, entrambi con il
                  marchio stampato. Pensato per essere già un regalo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CHI SIAMO */}
        <section className={styles.sectionLight}>
          <div className={styles.sectionInnerCentered}>
            <p className={styles.label}>CHI SIAMO</p>
            <h2 className={styles.titleDark}>Un progetto nato a Milano. Un'idea semplice.</h2>
            <p className={styles.textDarkCentered}>
              2dots nasce a Milano da una passione per il design essenziale
              e per gli animali. Il marchio è registrato. La collezione cresce.
            </p>
            <p className={styles.textDarkCentered} style={{ marginTop: "16px" }}>
              Per qualsiasi domanda, curiosità o proposta:
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
