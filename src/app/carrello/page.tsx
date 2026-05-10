"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { useCarrello, ArticoloCarrello } from "@/lib/carrello";
import { buildRigheCarrello, creaCarrello } from "@/lib/shopify-cart";
import { SHOPIFY_VARIANT_IDS } from "@/config/shopify";
import styles from "@styles/carrello.module.css";

const confezioneVariantMap: Record<string, string> = {
  sacchetto: SHOPIFY_VARIANT_IDS.sacchetto,
  astuccio: SHOPIFY_VARIANT_IDS.astuccio,
};

export default function CarrelloPage() {
  const { articoli, rimuovi, svuota, totale } = useCarrello();
  const [checkout, setCheckout] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    if (articoli.length === 0) return;
    setCheckout(true);
    try {
      const tutteLeRighe: any[] = [];

      for (const a of articoli) {
        const righe = buildRigheCarrello({
          animale: a.animale.nome,
          coloreCiondolo: a.coloreCiondolo === "nero" ? "Nero" : "Bianco",
          disegno: a.smalto.nome,
          swarovskiSx: a.occhioSx.nome,
          swarovskiDx: a.occhioDx.nome,
          cordino: a.cordino.nome,
          dedicaHum: a.dedicaHum,
          aggiungPet: a.aggiungPet,
          coloreCiondoloPet: a.coloreCiondoloPet === "nero" ? "Nero" : "Bianco",
          swarovskiSxPet: a.occhioSxPet?.nome || "",
          swarovskiDxPet: a.occhioDxPet?.nome || "",
          dedicaPet: a.dedicaPet,
          confezione: a.confezione.nome,
          confezioneVariantId: confezioneVariantMap[a.confezione.id] || null,
        });
        tutteLeRighe.push(...righe);
      }

      const cart = await creaCarrello(tutteLeRighe);
      svuota();
      window.location.href = cart.checkoutUrl;
    } catch (e) {
      console.error(e);
      alert("Errore nella creazione del carrello. Riprova.");
    } finally {
      setCheckout(false);
    }
  }

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.introLabel}>CARRELLO</p>
          <h1 className={styles.introTitolo}>Il tuo ordine</h1>
        </div>

        {articoli.length === 0 ? (
          <div className={styles.vuoto}>
            <p>Il carrello è vuoto.</p>
            <button className={styles.btnContinua} onClick={() => router.push("/configura")}>
              Configura un bijoux
            </button>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.lista}>
              {articoli.map((a) => (
                <ArticoloCard key={a.id} articolo={a} onRimuovi={() => rimuovi(a.id)} />
              ))}
              <button className={styles.btnAggiungi} onClick={() => router.push("/configura")}>
                + Aggiungi un altro bijoux
              </button>
            </div>

            <div className={styles.riepilogo}>
              <div className={styles.riepilogoInner}>
                <h2 className={styles.riepilogoTitolo}>Riepilogo</h2>
                {articoli.map((a, i) => (
                  <div key={a.id} className={styles.riepilogoRiga}>
                    <span>{a.animale.nome} {a.aggiungPet ? "+ PET" : ""}</span>
                    <span>€{a.prezzoTotale}</span>
                  </div>
                ))}
                <div className={styles.riepilogoTotale}>
                  <span>Totale</span>
                  <span>€{totale}</span>
                </div>
                <button
                  className={styles.btnCheckout}
                  onClick={handleCheckout}
                  disabled={checkout}
                >
                  {checkout ? "Preparazione..." : "Vai al checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function ArticoloCard({ articolo: a, onRimuovi }: { articolo: ArticoloCarrello; onRimuovi: () => void }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardImg}>
          {a.animale.immagineForma || a.animale.immagineDisegno ? (
            <img src={a.animale.immagineForma || a.animale.immagineDisegno} alt={a.animale.nome} />
          ) : (
            <span>{a.animale.nome[0]}</span>
          )}
        </div>
        <div className={styles.cardInfo}>
          <p className={styles.cardNome}>{a.animale.nome}</p>
          <p className={styles.cardSub}>Ciondolo {a.coloreCiondolo} · {a.smalto.nome}</p>
          {a.aggiungPet && <p className={styles.cardSub}>+ PET ({a.coloreCiondoloPet})</p>}
          {a.dedicaHum && <p className={styles.cardSub}>Dedica: "{a.dedicaHum}"</p>}
          <p className={styles.cardSub}>{a.confezione.nome}</p>
        </div>
        <div className={styles.cardDx}>
          <p className={styles.cardPrezzo}>€{a.prezzoTotale}</p>
          <button className={styles.btnRimuovi} onClick={onRimuovi}>Rimuovi</button>
        </div>
      </div>
    </div>
  );
}
