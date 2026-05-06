"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getAnimaliPubblicati, Animale } from "@/lib/animali";
import { getCristalli, getCordini, getSmalti, getFontDedica, getConfezioni, getImpostazioni, ItemColore, FontDedica, Confezione, Impostazioni } from "@/lib/configuratore";
import styles from "@styles/configura.module.css";

type Configurazione = {
  animale: Animale | null;
  coloreCiondolo: "nero" | "bianco" | null;
  smalto: ItemColore | null;
  occhioSx: ItemColore | null;
  occhioDx: ItemColore | null;
  cordino: ItemColore | null;
  dedicaHum: string;
  fontDedicaHum: FontDedica | null;
  aggiungPet: boolean;
  coloreCiondoloPet: "nero" | "bianco" | null;
  smaltoP: ItemColore | null;
  occhioSxPet: ItemColore | null;
  occhioDxPet: ItemColore | null;
  dedicaPet: string;
  fontDedicaPet: FontDedica | null;
  confezione: Confezione | null;
};

const EMPTY: Configurazione = {
  animale: null,
  coloreCiondolo: null,
  smalto: null,
  occhioSx: null,
  occhioDx: null,
  cordino: null,
  dedicaHum: "",
  fontDedicaHum: null,
  aggiungPet: false,
  coloreCiondoloPet: null,
  smaltoP: null,
  occhioSxPet: null,
  occhioDxPet: null,
  dedicaPet: "",
  fontDedicaPet: null,
  confezione: null,
};

function ConfiguraInner() {
  const searchParams = useSearchParams();
  const animaleParam = searchParams.get("animale");

  const [config, setConfig] = useState<Configurazione>(EMPTY);
  const [stepAttivo, setStepAttivo] = useState(animaleParam ? 1 : 0);
  const [loading, setLoading] = useState(true);

  const [animali, setAnimali] = useState<Animale[]>([]);
  const [cristalli, setCristalli] = useState<ItemColore[]>([]);
  const [cordini, setCordini] = useState<ItemColore[]>([]);
  const [smalti, setSmalti] = useState<ItemColore[]>([]);
  const [fonts, setFonts] = useState<FontDedica[]>([]);
  const [confezioni, setConfezioni] = useState<Confezione[]>([]);
  const [impostazioni, setImpostazioni] = useState<Impostazioni>({ prezzoBase: 45, prezzoPet: 15, prezzoDedica: 0 });

  useEffect(() => {
    async function carica() {
      const [a, cr, co, sm, fo, conf, imp] = await Promise.all([
        getAnimaliPubblicati(),
        getCristalli(),
        getCordini(),
        getSmalti(),
        getFontDedica(),
        getConfezioni(),
        getImpostazioni(),
      ]);
      setAnimali(a);
      setCristalli(cr.filter(x => x.attivo));
      setCordini(co.filter(x => x.attivo));
      setSmalti(sm.filter(x => x.attivo));
      setFonts(fo.filter(x => x.attivo));
      setConfezioni(conf.filter(x => x.attivo));
      setImpostazioni(imp);

      if (animaleParam) {
        const trovato = a.find(x => x.id === animaleParam);
        if (trovato) {
          setConfig(p => ({ ...p, animale: trovato }));
        }
      }
      setLoading(false);
    }
    carica();
  }, [animaleParam]);

  function update(partial: Partial<Configurazione>) {
    setConfig(p => ({ ...p, ...partial }));
  }

  // Calcolo prezzo
  const prezzoHum = config.animale?.prezzo || impostazioni.prezzoBase;
  const prezzoPet = config.aggiungPet ? (config.animale?.prezzoPet || impostazioni.prezzoPet) : 0;
  const prezzoConfezione = config.confezione?.prezzo || 0;
  const prezzoDedica = (config.dedicaHum ? impostazioni.prezzoDedica : 0) + (config.dedicaPet ? impostazioni.prezzoDedica : 0);
  const totale = prezzoHum + prezzoPet + prezzoConfezione + prezzoDedica;

  // Step completati
  const stepCompletati = {
    0: !!config.animale,
    1: !!config.coloreCiondolo,
    2: !!config.smalto,
    3: !!config.occhioSx,
    4: !!config.occhioDx,
    5: !!config.cordino,
    6: true, // dedica opzionale
    7: true, // pet opzionale
    8: !config.aggiungPet || (!!config.coloreCiondoloPet && !!config.smaltoP && !!config.occhioSxPet && !!config.occhioDxPet),
    9: !!config.confezione,
  };

  const tuttiCompletati = Object.values(stepCompletati).every(Boolean) && !!config.animale && !!config.coloreCiondolo && !!config.smalto && !!config.occhioSx && !!config.occhioDx && !!config.cordino && !!config.confezione;

  if (loading) return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <p className={styles.loading}>Caricamento...</p>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.layout}>

          {/* COLONNA SINISTRA — STEP */}
          <div className={styles.steps}>

            {/* STEP 0 — ANIMALE */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 0 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => setStepAttivo(0)}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.stepTitolo}>Scegli l'animale</span>
                {config.animale && <span className={styles.stepValore}>{config.animale.nome}</span>}
              </button>
              {stepAttivo === 0 && (
                <div className={styles.stepBody}>
                  <div className={styles.animaliGrid}>
                    {animali.map((a) => (
                      <button key={a.id}
                        className={`${styles.animaleCard} ${config.animale?.id === a.id ? styles.animaleCardSel : ""}`}
                        onClick={() => { update({ animale: a }); setStepAttivo(1); }}>
                        <div className={styles.animaleImg}>
                          {a.immagineDisegno && <img src={a.immagineDisegno} alt={a.nome} />}
                        </div>
                        <span className={styles.animaleNome}>{a.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 1 — COLORE CIONDOLO */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 1 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => stepCompletati[0] && setStepAttivo(1)}>
                <span className={styles.stepNum}>02</span>
                <span className={styles.stepTitolo}>Colore ciondolo</span>
                {config.coloreCiondolo && <span className={styles.stepValore}>{config.coloreCiondolo === "nero" ? "Nero" : "Bianco"}</span>}
              </button>
              {stepAttivo === 1 && (
                <div className={styles.stepBody}>
                  <div className={styles.sceltaRow}>
                    {["nero", "bianco"].map((c) => (
                      <button key={c}
                        className={`${styles.coloreBtn} ${config.coloreCiondolo === c ? styles.coloreBtnSel : ""}`}
                        onClick={() => { update({ coloreCiondolo: c as "nero" | "bianco" }); setStepAttivo(2); }}
                        style={{ background: c === "nero" ? "#1a1a1a" : "#f5f5f5", border: "2px solid", borderColor: config.coloreCiondolo === c ? "var(--color-navy)" : "transparent" }}>
                        <span style={{ color: c === "nero" ? "#fff" : "#1a1a1a" }}>{c === "nero" ? "Nero" : "Bianco"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2 — SMALTO */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 2 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => stepCompletati[1] && setStepAttivo(2)}>
                <span className={styles.stepNum}>03</span>
                <span className={styles.stepTitolo}>Colore smalto</span>
                {config.smalto && <span className={styles.stepValore}>{config.smalto.nome}</span>}
              </button>
              {stepAttivo === 2 && (
                <div className={styles.stepBody}>
                  <div className={styles.coloriGrid}>
                    {smalti.map((s) => (
                      <button key={s.id}
                        className={`${styles.coloreCircle} ${config.smalto?.id === s.id ? styles.coloreCircleSel : ""}`}
                        onClick={() => { update({ smalto: s }); setStepAttivo(3); }}
                        title={s.nome}>
                        <div className={styles.coloreCircleInner} style={{ background: s.coloreCSS }} />
                        <span className={styles.coloreNome}>{s.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3 — OCCHIO SX */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 3 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => stepCompletati[2] && setStepAttivo(3)}>
                <span className={styles.stepNum}>04</span>
                <span className={styles.stepTitolo}>Occhio sinistro</span>
                {config.occhioSx && <span className={styles.stepValore}>{config.occhioSx.nome}</span>}
              </button>
              {stepAttivo === 3 && (
                <div className={styles.stepBody}>
                  <div className={styles.coloriGrid}>
                    {cristalli.map((c) => (
                      <button key={c.id}
                        className={`${styles.coloreCircle} ${config.occhioSx?.id === c.id ? styles.coloreCircleSel : ""}`}
                        onClick={() => { update({ occhioSx: c }); setStepAttivo(4); }}
                        title={c.nome}>
                        <div className={styles.coloreCircleInner} style={{ background: c.coloreCSS }} />
                        <span className={styles.coloreNome}>{c.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4 — OCCHIO DX */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 4 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => stepCompletati[3] && setStepAttivo(4)}>
                <span className={styles.stepNum}>05</span>
                <span className={styles.stepTitolo}>Occhio destro</span>
                {config.occhioDx && <span className={styles.stepValore}>{config.occhioDx.nome}</span>}
              </button>
              {stepAttivo === 4 && (
                <div className={styles.stepBody}>
                  <div className={styles.coloriGrid}>
                    {cristalli.map((c) => (
                      <button key={c.id}
                        className={`${styles.coloreCircle} ${config.occhioDx?.id === c.id ? styles.coloreCircleSel : ""}`}
                        onClick={() => { update({ occhioDx: c }); setStepAttivo(5); }}
                        title={c.nome}>
                        <div className={styles.coloreCircleInner} style={{ background: c.coloreCSS }} />
                        <span className={styles.coloreNome}>{c.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 5 — CORDINO */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 5 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => stepCompletati[4] && setStepAttivo(5)}>
                <span className={styles.stepNum}>06</span>
                <span className={styles.stepTitolo}>Cordino</span>
                {config.cordino && <span className={styles.stepValore}>{config.cordino.nome}</span>}
              </button>
              {stepAttivo === 5 && (
                <div className={styles.stepBody}>
                  <div className={styles.coloriGrid}>
                    {cordini.map((c) => (
                      <button key={c.id}
                        className={`${styles.coloreCircle} ${config.cordino?.id === c.id ? styles.coloreCircleSel : ""}`}
                        onClick={() => { update({ cordino: c }); setStepAttivo(6); }}
                        title={c.nome}>
                        <div className={styles.coloreCircleInner} style={{ background: c.coloreCSS }} />
                        <span className={styles.coloreNome}>{c.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 6 — DEDICA HUM */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 6 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => stepCompletati[5] && setStepAttivo(6)}>
                <span className={styles.stepNum}>07</span>
                <span className={styles.stepTitolo}>Dedica sul retro <span className={styles.opzionale}>(opzionale)</span></span>
                {config.dedicaHum && <span className={styles.stepValore}>"{config.dedicaHum}"</span>}
              </button>
              {stepAttivo === 6 && (
                <div className={styles.stepBody}>
                  {fonts.length > 0 && (
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Stile carattere</label>
                      <div className={styles.sceltaRow}>
                        {fonts.map((f) => (
                          <button key={f.id}
                            className={`${styles.fontBtn} ${config.fontDedicaHum?.id === f.id ? styles.fontBtnSel : ""}`}
                            onClick={() => update({ fontDedicaHum: f })}>
                            <span style={{ fontFamily: f.famiglia, fontSize: 16 }}>Aa</span>
                            <span className={styles.fontDesc}>{f.descrizione}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Testo dedica</label>
                    {(config.fontDedicaHum || fonts[0]) && (() => {
                      const font = config.fontDedicaHum || fonts[0];
                      return (
                        <textarea
                          className={styles.dedicaTextarea}
                          style={{ fontFamily: font.famiglia, fontSize: font.sizePx }}
                          value={config.dedicaHum}
                          rows={font.righe}
                          maxLength={font.righe * font.caratteriPerRiga}
                          placeholder={`Max ${font.righe} righe × ${font.caratteriPerRiga} caratteri`}
                          onChange={(e) => update({ dedicaHum: e.target.value })}
                        />
                      );
                    })()}
                    <p className={styles.hint}>
                      {config.dedicaHum.length}/{(config.fontDedicaHum || fonts[0])?.righe * (config.fontDedicaHum || fonts[0])?.caratteriPerRiga || 45} caratteri
                      {impostazioni.prezzoDedica > 0 && ` — supplemento €${impostazioni.prezzoDedica}`}
                    </p>
                  </div>
                  <button className={styles.nextBtn} onClick={() => setStepAttivo(7)}>Continua →</button>
                </div>
              )}
            </div>

            {/* STEP 7 — PET */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 7 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => setStepAttivo(7)}>
                <span className={styles.stepNum}>08</span>
                <span className={styles.stepTitolo}>Aggiungi ciondolo PET <span className={styles.opzionale}>(opzionale)</span></span>
                {config.aggiungPet && <span className={styles.stepValore}>Sì</span>}
              </button>
              {stepAttivo === 7 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>Un ciondolo abbinato da agganciare al collare del tuo animale.</p>
                  <div className={styles.sceltaRow}>
                    <button className={`${styles.sceltaBtn} ${!config.aggiungPet ? styles.sceltaBtnSel : ""}`}
                      onClick={() => { update({ aggiungPet: false }); setStepAttivo(8); }}>
                      No grazie
                    </button>
                    <button className={`${styles.sceltaBtn} ${config.aggiungPet ? styles.sceltaBtnSel : ""}`}
                      onClick={() => { update({ aggiungPet: true }); setStepAttivo(8); }}>
                      Sì, aggiungi PET
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 8 — CONFIG PET (solo se aggiunto) */}
            {config.aggiungPet && (
              <div className={styles.step}>
                <button className={`${styles.stepHeader} ${stepAttivo === 8 ? styles.stepHeaderAttivo : ""}`}
                  onClick={() => setStepAttivo(8)}>
                  <span className={styles.stepNum}>09</span>
                  <span className={styles.stepTitolo}>Configura il PET</span>
                </button>
                {stepAttivo === 8 && (
                  <div className={styles.stepBody}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Colore ciondolo PET</label>
                      <div className={styles.sceltaRow}>
                        {["nero", "bianco"].map((c) => (
                          <button key={c}
                            className={`${styles.coloreBtn} ${config.coloreCiondoloPet === c ? styles.coloreBtnSel : ""}`}
                            onClick={() => update({ coloreCiondoloPet: c as "nero" | "bianco" })}
                            style={{ background: c === "nero" ? "#1a1a1a" : "#f5f5f5", border: "2px solid", borderColor: config.coloreCiondoloPet === c ? "var(--color-navy)" : "transparent" }}>
                            <span style={{ color: c === "nero" ? "#fff" : "#1a1a1a" }}>{c === "nero" ? "Nero" : "Bianco"}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Smalto PET</label>
                      <div className={styles.coloriGrid}>
                        {smalti.map((s) => (
                          <button key={s.id}
                            className={`${styles.coloreCircle} ${config.smaltoP?.id === s.id ? styles.coloreCircleSel : ""}`}
                            onClick={() => update({ smaltoP: s })} title={s.nome}>
                            <div className={styles.coloreCircleInner} style={{ background: s.coloreCSS }} />
                            <span className={styles.coloreNome}>{s.nome}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Occhio sinistro PET</label>
                      <div className={styles.coloriGrid}>
                        {cristalli.map((c) => (
                          <button key={c.id}
                            className={`${styles.coloreCircle} ${config.occhioSxPet?.id === c.id ? styles.coloreCircleSel : ""}`}
                            onClick={() => update({ occhioSxPet: c })} title={c.nome}>
                            <div className={styles.coloreCircleInner} style={{ background: c.coloreCSS }} />
                            <span className={styles.coloreNome}>{c.nome}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Occhio destro PET</label>
                      <div className={styles.coloriGrid}>
                        {cristalli.map((c) => (
                          <button key={c.id}
                            className={`${styles.coloreCircle} ${config.occhioDxPet?.id === c.id ? styles.coloreCircleSel : ""}`}
                            onClick={() => update({ occhioDxPet: c })} title={c.nome}>
                            <div className={styles.coloreCircleInner} style={{ background: c.coloreCSS }} />
                            <span className={styles.coloreNome}>{c.nome}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Dedica PET <span className={styles.opzionale}>(opzionale)</span></label>
                      {(config.fontDedicaPet || fonts[0]) && (() => {
                        const font = config.fontDedicaPet || fonts[0];
                        return (
                          <textarea
                            className={styles.dedicaTextarea}
                            style={{ fontFamily: font.famiglia, fontSize: font.sizePx }}
                            value={config.dedicaPet}
                            rows={font.righe}
                            maxLength={font.righe * font.caratteriPerRiga}
                            placeholder={`Max ${font.righe} righe × ${font.caratteriPerRiga} caratteri`}
                            onChange={(e) => update({ dedicaPet: e.target.value })}
                          />
                        );
                      })()}
                    </div>
                    <button className={styles.nextBtn} onClick={() => setStepAttivo(9)}>Continua →</button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 9 — CONFEZIONE */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 9 ? styles.stepHeaderAttivo : ""}`}
                onClick={() => setStepAttivo(9)}>
                <span className={styles.stepNum}>{config.aggiungPet ? "10" : "09"}</span>
                <span className={styles.stepTitolo}>Confezione</span>
                {config.confezione && <span className={styles.stepValore}>{config.confezione.nome}</span>}
              </button>
              {stepAttivo === 9 && (
                <div className={styles.stepBody}>
                  <div className={styles.confezioniGrid}>
                    {confezioni.map((c) => (
                      <button key={c.id}
                        className={`${styles.confezioneCard} ${config.confezione?.id === c.id ? styles.confezioneCardSel : ""}`}
                        onClick={() => update({ confezione: c })}>
                        {c.immagini?.[0] && (
                          <div className={styles.confezioneImg}>
                            <img src={c.immagini[0]} alt={c.nome} />
                          </div>
                        )}
                        <p className={styles.confezioneNome}>{c.nome}</p>
                        <p className={styles.confezioneDesc}>{c.descrizione}</p>
                        {c.prezzo > 0 && <p className={styles.confezionePrezzo}>+€{c.prezzo}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* COLONNA DESTRA — RIEPILOGO */}
          <div className={styles.riepilogo}>
            <div className={styles.riepilogoInner}>

              {/* ANTEPRIMA */}
              <div className={styles.anteprima}>
                {config.animale?.immagineDisegno ? (
                  <img src={config.animale.immagineDisegno} alt={config.animale.nome}
                    className={styles.anteprimaImg}
                    style={{ filter: config.coloreCiondolo === "bianco" ? "invert(1)" : "none" }} />
                ) : (
                  <div className={styles.anteprimaPlaceholder}>
                    <span>2dots</span>
                  </div>
                )}
              </div>

              {/* DETTAGLI RIEPILOGO */}
              <div className={styles.riepilogoDettagli}>
                {config.animale && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Animale</span>
                    <span className={styles.riepilogoValore}>{config.animale.nome}</span>
                  </div>
                )}
                {config.coloreCiondolo && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Ciondolo</span>
                    <span className={styles.riepilogoValore}>{config.coloreCiondolo === "nero" ? "Nero" : "Bianco"}</span>
                  </div>
                )}
                {config.smalto && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Smalto</span>
                    <span className={styles.riepilogoValore}>{config.smalto.nome}</span>
                  </div>
                )}
                {config.occhioSx && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Occhio sx</span>
                    <span className={styles.riepilogoValore}>{config.occhioSx.nome}</span>
                  </div>
                )}
                {config.occhioDx && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Occhio dx</span>
                    <span className={styles.riepilogoValore}>{config.occhioDx.nome}</span>
                  </div>
                )}
                {config.cordino && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Cordino</span>
                    <span className={styles.riepilogoValore}>{config.cordino.nome}</span>
                  </div>
                )}
                {config.dedicaHum && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Dedica</span>
                    <span className={styles.riepilogoValore}>"{config.dedicaHum}"</span>
                  </div>
                )}
                {config.aggiungPet && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>PET</span>
                    <span className={styles.riepilogoValore}>Aggiunto</span>
                  </div>
                )}
                {config.confezione && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Confezione</span>
                    <span className={styles.riepilogoValore}>{config.confezione.nome}</span>
                  </div>
                )}
              </div>

              {/* PREZZO */}
              <div className={styles.prezzoBox}>
                <div className={styles.prezzoRiga}>
                  <span>HUM</span>
                  <span>€{prezzoHum}</span>
                </div>
                {config.aggiungPet && (
                  <div className={styles.prezzoRiga}>
                    <span>PET</span>
                    <span>€{prezzoPet}</span>
                  </div>
                )}
                {prezzoDedica > 0 && (
                  <div className={styles.prezzoRiga}>
                    <span>Dedica</span>
                    <span>€{prezzoDedica}</span>
                  </div>
                )}
                {prezzoConfezione > 0 && (
                  <div className={styles.prezzoRiga}>
                    <span>Confezione</span>
                    <span>€{prezzoConfezione}</span>
                  </div>
                )}
                <div className={styles.prezzoTotale}>
                  <span>Totale</span>
                  <span>€{totale}</span>
                </div>
              </div>

              {/* CTA */}
              <button className={styles.ctaBtn} disabled={!tuttiCompletati}>
                {tuttiCompletati ? "Aggiungi al carrello" : "Completa la configurazione"}
              </button>

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

export default function Configura() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <ConfiguraInner />
    </Suspense>
  );
}
