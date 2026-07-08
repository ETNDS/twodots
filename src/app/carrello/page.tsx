"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { useCarrello, ArticoloCarrello } from "@/lib/carrello";
import { getFasceSconto, calcolaSconto, FasciaSconto } from "@/lib/configuratore";
import styles from "@styles/carrello.module.css";

export default function CarrelloPage() {
  const { articoli, rimuovi, svuota, totale, totalePezzi } = useCarrello();
  const [checkout, setCheckout] = useState(false);
  const [confermaVuota, setConfermaVuota] = useState(false);
  const [fasceSconto, setFasceSconto] = useState<FasciaSconto[]>([]);
  const router = useRouter();

  useEffect(() => { getFasceSconto().then(setFasceSconto); }, []);

  const fasciaAttiva = calcolaSconto(fasceSconto, totalePezzi);

  // "totale" dal context è già la somma di prezzoHumConPet * qty
  // prezzoHumConPet include già lo sconto PET — è la base corretta per lo sconto YOU

  // Sconto YOU sul totale già scontato PET
  const importoScontoYou = fasciaAttiva
    ? Math.round(totale * fasciaAttiva.percentuale) / 100
    : 0;
  const totaleScontato = Math.round((totale - importoScontoYou) * 100) / 100;

  // Arrotondamento all'unità inferiore
  const arrotondamento = totaleScontato > Math.floor(totaleScontato)
    ? Math.round((Math.floor(totaleScontato) - totaleScontato) * 100) / 100
    : 0;
  const totalePagato = Math.round((totaleScontato + arrotondamento) * 100) / 100;

  async function handleCheckout() {
    if (articoli.length === 0) return;
    setCheckout(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articoli,
          codiceSconto: fasciaAttiva?.codiceShopify || undefined,
          scontoYouPercentuale: fasciaAttiva?.percentuale || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Checkout error:", err);
        alert("Errore nella creazione dell'ordine. Riprova.");
        setCheckout(false);
        return;
      }

      const { checkoutUrl } = await res.json();
      svuota();
      router.push(checkoutUrl);

    } catch (err) {
      console.error("Checkout error:", err);
      alert("Errore di rete. Riprova.");
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
            <button className={styles.btnContinua} onClick={() => router.push("/configura")}>Configura un bijoux</button>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.lista}>
              {articoli.map((a) => (
                <ArticoloCard key={a.id} articolo={a} onRimuovi={() => rimuovi(a.id)} />
              ))}
              <div className={styles.listaAzioni}>
                <button className={styles.btnAggiungi} onClick={() => router.push("/configura")}>
                  + Aggiungi un altro bijoux
                </button>
                {!confermaVuota ? (
                  <button className={styles.btnSvuota} onClick={() => setConfermaVuota(true)}>Svuota carrello</button>
                ) : (
                  <div className={styles.svuotaConferma}>
                    <span className={styles.svuotaConfermaLabel}>Sicuro?</span>
                    <button className={styles.btnSvuotaConferma} onClick={() => { svuota(); setConfermaVuota(false); }}>Sì, svuota</button>
                    <button className={styles.btnSvuotaAnnulla} onClick={() => setConfermaVuota(false)}>Annulla</button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.riepilogo}>
              <div className={styles.riepilogoInner}>
                <h2 className={styles.riepilogoTitolo}>Riepilogo</h2>
                {articoli.map((a) => (
                  <div key={a.id} className={styles.riepilogoArticolo}>
                    {/* Costo unitario — 1 set */}
                    <div className={styles.riepilogoRiga}>
                      <span>{a.animale.nome}</span>
                      <span>€{a.animale.prezzo || 45}</span>
                    </div>
                    {a.dedicaHum && (
                      <div className={styles.riepilogoRiga}>
                        <span>Dedica</span>
                        <span>€4</span>
                      </div>
                    )}
                    {a.pet.length > 0 && (
                      <div className={styles.riepilogoPetGroup}>
                        <span className={styles.riepilogoPetGroupLabel}>↳ bijoux PET nel set: {a.pet.length}</span>
                        {a.pet.map((pet, i) => (
                          <div key={pet.uid}>
                            <div className={styles.riepilogoRiga}>
                              <span>PET {i + 1}{pet.etichettaSizePet ? ` · ${pet.etichettaSizePet}` : ""}</span>
                              <span>€{a.animale.prezzoPet || 15}</span>
                            </div>
                            {pet.dedicaPet && (
                              <div className={styles.riepilogoRiga}>
                                <span>Dedica PET {i + 1}</span>
                                <span>€{a.dedicaHum ? 2 : 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {a.scontoPetPercentuale > 0 && (() => {
                      const totaleLordoPet = a.pet.reduce((acc, pet) => {
                        const dedica = pet.dedicaPet ? (a.dedicaHum ? 2 : 4) : 0;
                        return acc + (a.animale.prezzoPet || 15) + dedica;
                      }, 0);
                      const importoSconto = Math.round(totaleLordoPet * a.scontoPetPercentuale) / 100;
                      return (
                        <div className={styles.riepilogoSconto}>
                          <span>Sconto PET {a.scontoPetPercentuale}%</span>
                          <span>−€{importoSconto}</span>
                        </div>
                      );
                    })()}
                    {a.confezione.prezzo > 0 && (
                      <div className={styles.riepilogoRiga}>
                        <span>Confezione</span>
                        <span>€{a.confezione.prezzo}</span>
                      </div>
                    )}
                    {/* Riga unitario */}
                    <div className={styles.riepilogoUnitario}>
                      <span>1 set</span>
                      <span>€{a.prezzoHumConPet}</span>
                    </div>
                    {/* Moltiplicazione se quantità > 1 */}
                    {a.quantitaHum > 1 && (
                      <div className={styles.riepilogoMoltiplica}>
                        <span>× {a.quantitaHum}</span>
                        <span>€{a.prezzoHumConPet * a.quantitaHum}</span>
                      </div>
                    )}
                  </div>
                ))}
                {fasciaAttiva && (
                  <>
                    <div className={styles.riepilogoTotalePreSconto}>
                      <span>Totale set</span>
                      <span>€{totale}</span>
                    </div>
                    <div className={styles.riepilogoSconto}>
                      <span>Sconto YOU {fasciaAttiva.percentuale}%</span>
                      <span>−€{importoScontoYou}</span>
                    </div>
                    <div className={styles.riepilogoTotalePreSconto}>
                      <span>Totale scontato</span>
                      <span>€{totaleScontato}</span>
                    </div>
                  </>
                )}
                {arrotondamento < 0 && (
                  <div className={styles.riepilogoSconto}>
                    <span>Arrotondamento</span>
                    <span>€{arrotondamento}</span>
                  </div>
                )}
                <div className={styles.riepilogoTotale}>
                  <span>Totale</span>
                  <span>€{totalePagato}</span>
                </div>
                <button className={styles.btnCheckout} onClick={handleCheckout} disabled={checkout}>
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
          <p className={styles.cardSub}>Bijoux: {a.coloreCiondolo} · Disegno: {a.smalto.nome}</p>
          <p className={styles.cardSub}>Swarovski: {a.occhioSx.nome} (sx) · {a.occhioDx.nome} (dx)</p>
          <p className={styles.cardSub}>Cordino: {a.cordino.nome}</p>
          {a.dedicaHum && (
            <div className={styles.cardSub}>
              <span>Dedica: </span>
              {a.dedicaHum.split("\n").map((riga, ri) => (
                <span key={ri}>{ri > 0 && <br />}{riga}</span>
              ))}
            </div>
          )}
          <p className={styles.cardSub}>Confezione: {a.confezione.nome}</p>
          {a.pet.length > 0 && (
            <div className={styles.cardPetGroup}>
              <span className={styles.cardPetGroupLabel}>↳ bijoux PET nel set: {a.pet.length}</span>
              {a.pet.map((pet, i) => (
                <div key={pet.uid} className={styles.cardPetItem}>
                  <p className={styles.cardSub}><strong>PET #{i + 1}</strong></p>
                  <p className={styles.cardSub}>{pet.etichettaSizePet ? `Taglia: ${pet.etichettaSizePet} · ` : ""}Bijoux: {pet.coloreCiondoloPet?.nome}</p>
                  {pet.occhioSxPet && <p className={styles.cardSub}>Swarovski: {pet.occhioSxPet.nome} (sx){pet.occhioDxPet ? ` · ${pet.occhioDxPet.nome} (dx)` : ""}</p>}
                  {pet.dedicaPet && (
                    <div className={styles.cardSub}>
                      <span>Dedica: </span>
                      {pet.dedicaPet.split("\n").map((riga, ri) => (
                        <span key={ri}>{ri > 0 && <br />}{riga}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.cardDx}>
          <div className={styles.cardPrezzoBox}>
            <span className={styles.cardQuantita}>Q.tà: {a.quantitaHum}</span>
            <p className={styles.cardPrezzo}>€{a.prezzoHumConPet * a.quantitaHum}</p>
          </div>
          <button className={styles.btnRimuovi} onClick={onRimuovi}>Rimuovi</button>
        </div>
      </div>
    </div>
  );
}
