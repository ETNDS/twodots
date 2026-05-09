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
  occhioSxPet: null,
  occhioDxPet: null,
  dedicaPet: "",
  fontDedicaPet: null,
  confezione: null,
};

// Testi descrittivi per ogni step
const STEP_DESC: Record<number, string> = {
  0: "Scegli il tuo animale preferito. Ogni animale ha un proprio ciondolo che vedi nel riepilogo a destra.",
  1: "Scegli il colore del ciondolo.",
  2: "Scegli il colore dello smalto che colora il disegno dell'animale.",
  3: "Scegli il cristallo Swarovski per l'occhio sinistro.",
  4: "Scegli il cristallo Swarovski per l'occhio destro.",
  5: "Scegli il colore del cordino composto da materiale ecosostenibile 100% riciclato.",
  6: "Puoi incidere una dedica personalizzata sul retro del ciondolo.",
  7: "Aggiungi un ciondolo abbinato da agganciare al collare del tuo animale.",
  9: "Scegli come vuoi ricevere il tuo ordine.",
};

function ciondoloGradient(colore: "nero" | "bianco"): string {
  if (colore === "nero") {
    return "radial-gradient(ellipse at 50% 30%, #888 0%, #1a1a1a 50%, #000 100%)";
  }
  return "radial-gradient(ellipse at 50% 30%, #fff 0%, #e0e0e0 50%, #aaa 100%)";
}

function coloreGradient(css: string): string {
  return `radial-gradient(circle at 35% 35%, white 0%, ${css} 45%, color-mix(in srgb, ${css} 60%, black) 100%)`;
}

function ColoreCircle({ item, selezionato, onClick }: { item: ItemColore; selezionato: boolean; onClick: () => void; }) {
  const [popup, setPopup] = useState(false);
  const immagini = item.immagini?.filter(u => u) || [];

  return (
    <div className={styles.coloreCircleWrapper}>
      <button className={styles.coloreCircle} onClick={onClick} title={item.nome}>
        <div className={styles.coloreCircleInner} style={{
          background: coloreGradient(item.coloreCSS)
        }} />
        <span className={`${styles.coloreNome} ${selezionato ? styles.coloreNomeSelezionato : ""}`}>
          {selezionato && <span className={styles.coloreSpunta}>✓</span>}{item.nome}
        </span>
      </button>
      {immagini.length > 0 && (
        <button className={styles.imgPopupTrigger} onClick={(e) => { e.stopPropagation(); setPopup(true); }} title="Vedi immagini">⌕</button>
      )}
      {popup && (
        <div className={styles.popupOverlay} onClick={() => setPopup(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <div className={styles.popupColore} style={{ background: item.coloreCSS }} />
              <h3 className={styles.popupNome}>{item.nome}</h3>
              <button className={styles.popupClose} onClick={() => setPopup(false)}>×</button>
            </div>
            <div className={styles.popupImmagini}>
              {immagini.map((url, i) => (
                <img key={i} src={url} alt={`${item.nome} ${i + 1}`} className={styles.popupImg} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RiepilogoColore({ item }: { item: ItemColore }) {
  const img = item.immagini?.filter(u => u)?.[0] || null;
  if (img) {
    return <img src={img} alt={item.nome} className={styles.riepilogoImg} />;
  }
  return (
    <div className={styles.riepilogoColoreDot} style={{ background: coloreGradient(item.coloreCSS) }} />
  );
}

function PetConfig({ config, cristalli, fonts, impostazioni, update, onContinua }: {
  config: Configurazione;
  cristalli: ItemColore[];
  fonts: FontDedica[];
  impostazioni: Impostazioni;
  update: (p: Partial<Configurazione>) => void;
  onContinua: () => void;
}) {
  const [subStep, setSubStep] = useState(0);

  return (
    <div className={styles.stepBody}>

      {/* a — COLORE CIONDOLO */}
      <div className={styles.step}>
        <button className={`${styles.stepHeader} ${subStep === 0 ? styles.stepHeaderAttivo : ""}`}
          onClick={() => setSubStep(0)}>
          <span className={styles.stepNum}>a</span>
          <span className={styles.stepTitolo}>Colore ciondolo PET</span>
          {config.coloreCiondoloPet && <span className={styles.stepValore}>{config.coloreCiondoloPet === "nero" ? "Nero" : "Bianco"}</span>}
        </button>
        {subStep === 0 && (
          <div className={styles.stepBody}>
            <div className={styles.sceltaRow}>
              {(["nero", "bianco"] as const).map((c) => (
                <button key={c}
                  className={`${styles.coloreCiondoloBtn} ${config.coloreCiondoloPet === c ? styles.coloreCiondoloBtnSel : ""}`}
                  onClick={() => { update({ coloreCiondoloPet: c }); setSubStep(1); }}>
                  <div className={styles.coloreCiondoloBall} style={{ background: ciondoloGradient(c) }} />
                  <span className={styles.coloreCiondoloNome}>{c === "nero" ? "Nero" : "Bianco"}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* b — OCCHIO SX */}
      <div className={styles.step}>
        <button className={`${styles.stepHeader} ${subStep === 1 ? styles.stepHeaderAttivo : ""}`}
          onClick={() => config.coloreCiondoloPet && setSubStep(1)}>
          <span className={styles.stepNum}>b</span>
          <span className={styles.stepTitolo}>Swarovski Occhio sinistro PET</span>
          {config.occhioSxPet && <span className={styles.stepValore}>{config.occhioSxPet.nome}</span>}
        </button>
        {subStep === 1 && (
          <div className={styles.stepBody}>
            <div className={styles.coloriGrid}>
              {cristalli.map((c) => (
                <ColoreCircle key={c.id} item={c}
                  selezionato={config.occhioSxPet?.id === c.id}
                  onClick={() => { update({ occhioSxPet: c }); setSubStep(2); }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* c — OCCHIO DX */}
      <div className={styles.step}>
        <button className={`${styles.stepHeader} ${subStep === 2 ? styles.stepHeaderAttivo : ""}`}
          onClick={() => config.occhioSxPet && setSubStep(2)}>
          <span className={styles.stepNum}>c</span>
          <span className={styles.stepTitolo}>Swarovski Occhio destro PET</span>
          {config.occhioDxPet && <span className={styles.stepValore}>{config.occhioDxPet.nome}</span>}
        </button>
        {subStep === 2 && (
          <div className={styles.stepBody}>
            <div className={styles.coloriGrid}>
              {cristalli.map((c) => (
                <ColoreCircle key={c.id} item={c}
                  selezionato={config.occhioDxPet?.id === c.id}
                  onClick={() => { update({ occhioDxPet: c }); setSubStep(3); }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* d — DEDICA */}
      <div className={styles.step}>
        <button className={`${styles.stepHeader} ${subStep === 3 ? styles.stepHeaderAttivo : ""}`}
          onClick={() => config.occhioDxPet && setSubStep(3)}>
          <span className={styles.stepNum}>d</span>
          <span className={styles.stepTitolo}>Dedica PET <span className={styles.opzionale}>(opzionale)</span></span>
          {config.dedicaPet && <span className={styles.stepValore}>"{config.dedicaPet}"</span>}
        </button>
        {subStep === 3 && (
          <div className={styles.stepBody}>
            {(config.fontDedicaPet || fonts[0]) && (() => {
              const font = config.fontDedicaPet || fonts[0];
              const maxTotale = font.righe * font.caratteriPerRiga;

              function handleDedicaPet(val: string) {
                const righe = val.split("\n");
                const righeValide = righe
                  .slice(0, font.righe)
                  .map(r => r.slice(0, font.caratteriPerRiga));
                update({ dedicaPet: righeValide.join("\n") });
              }

              return (
                <>
                  <textarea
                    className={styles.dedicaTextarea}
                    style={{ fontFamily: font.famiglia, fontSize: font.sizePx }}
                    value={config.dedicaPet}
                    rows={font.righe}
                    placeholder={`Max ${font.righe} righe × ${font.caratteriPerRiga} caratteri`}
                    onChange={(e) => handleDedicaPet(e.target.value)}
                  />
                  <p className={styles.hint}>
                    {config.dedicaPet.replace(/\n/g, "").length}/{maxTotale} caratteri
                  </p>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <button className={styles.nextBtn} onClick={onContinua}>Continua →</button>
    </div>
  );
}

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
  const [impostazioni, setImpostazioni] = useState<Impostazioni>({ prezzoBase: 45, prezzoPet: 15, prezzoDedica: 0, prezzoDedicaPet: 0 });

  useEffect(() => {
    async function carica() {
      const [a, cr, co, sm, fo, conf, imp] = await Promise.all([
        getAnimaliPubblicati(), getCristalli(), getCordini(), getSmalti(), getFontDedica(), getConfezioni(), getImpostazioni(),
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
        if (trovato) setConfig(p => ({ ...p, animale: trovato }));
      }
      setLoading(false);
    }
    carica();
  }, [animaleParam]);

  function update(partial: Partial<Configurazione>) {
    setConfig(p => ({ ...p, ...partial }));
  }

  const prezzoHum = config.animale?.prezzo || impostazioni.prezzoBase;
  const prezzoPet = config.aggiungPet ? (config.animale?.prezzoPet || impostazioni.prezzoPet) : 0;
  const prezzoConfezione = config.confezione?.prezzo || 0;
  const prezzoDedica = (config.dedicaHum.trim() ? (impostazioni.prezzoDedica || 0) : 0) + (config.dedicaPet.trim() ? (impostazioni.prezzoDedicaPet || 0) : 0);
  const totale = prezzoHum + prezzoPet + prezzoConfezione + prezzoDedica;

  const stepCompletati = {
    0: !!config.animale,
    1: !!config.coloreCiondolo,
    2: !!config.smalto,
    3: !!config.occhioSx,
    4: !!config.occhioDx,
    5: !!config.cordino,
    6: true,
    7: true,
    8: !config.aggiungPet || (!!config.coloreCiondoloPet && !!config.occhioSxPet && !!config.occhioDxPet),
    9: !!config.confezione,
  };

  const tuttiCompletati = Object.values(stepCompletati).every(Boolean) && !!config.animale && !!config.coloreCiondolo && !!config.smalto && !!config.occhioSx && !!config.occhioDx && !!config.cordino && !!config.confezione;

  if (loading) return (
    <>
      <BackgroundLogo /><Navbar />
      <main className={styles.main}><p className={styles.loading}>Caricamento...</p></main>
      <Footer />
    </>
  );

  return (
    <>
      <BackgroundLogo />
      <Navbar />
        <main className={styles.main}>
        <div className={styles.intro}>
            <p className={styles.introLabel}>CONFIGURA</p>
            <h1 className={styles.introTitolo}>Crea il tuo bijoux</h1>
        </div>

        <div className={styles.layout}>
          <div className={styles.steps}>

            {/* STEP 0 — ANIMALE */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 0 ? styles.stepHeaderAttivo : ""}`} onClick={() => setStepAttivo(0)}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.stepTitolo}>Scegli l'animale</span>
                {config.animale && <span className={styles.stepValore}>{config.animale.nome}</span>}
              </button>
              {stepAttivo === 0 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[0]}</p>
                  <div className={styles.animaliGrid}>
                    {animali.map((a) => (
                      <button key={a.id} className={`${styles.animaleCard} ${config.animale?.id === a.id ? styles.animaleCardSel : ""}`}
                        onClick={() => { update({ animale: a }); setStepAttivo(1); }}>
                        <div className={styles.animaleImg}>{a.immagineDisegno && <img src={a.immagineDisegno} alt={a.nome} />}</div>
                        <span className={styles.animaleNome}>{a.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 1 — COLORE CIONDOLO */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 1 ? styles.stepHeaderAttivo : ""}`} onClick={() => stepCompletati[0] && setStepAttivo(1)}>
                <span className={styles.stepNum}>02</span>
                <span className={styles.stepTitolo}>Colore ciondolo</span>
                {config.coloreCiondolo && <span className={styles.stepValore}>{config.coloreCiondolo === "nero" ? "Nero" : "Bianco"}</span>}
              </button>
              {stepAttivo === 1 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[1]}</p>
                  <div className={styles.sceltaRow}>
                    {(["nero", "bianco"] as const).map((c) => (
                      <button key={c} className={`${styles.coloreCiondoloBtn} ${config.coloreCiondolo === c ? styles.coloreCiondoloBtnSel : ""}`}
                        onClick={() => { update({ coloreCiondolo: c }); setStepAttivo(2); }}>
                        <div className={styles.coloreCiondoloBall} style={{ background: ciondoloGradient(c) }} />
                        <span className={styles.coloreCiondoloNome}>{c === "nero" ? "Nero" : "Bianco"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2 — SMALTO */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 2 ? styles.stepHeaderAttivo : ""}`} onClick={() => stepCompletati[1] && setStepAttivo(2)}>
                <span className={styles.stepNum}>03</span>
                <span className={styles.stepTitolo}>Colore disegno</span>
                {config.smalto && <span className={styles.stepValore}>{config.smalto.nome}</span>}
              </button>
              {stepAttivo === 2 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[2]}</p>
                  <div className={styles.coloriGrid}>
                    {smalti.map((s) => <ColoreCircle key={s.id} item={s} selezionato={config.smalto?.id === s.id} onClick={() => { update({ smalto: s }); setStepAttivo(3); }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3 — OCCHIO SX */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 3 ? styles.stepHeaderAttivo : ""}`} onClick={() => stepCompletati[2] && setStepAttivo(3)}>
                <span className={styles.stepNum}>04</span>
                <span className={styles.stepTitolo}>Swarovski Occhio sinistro</span>
                {config.occhioSx && <span className={styles.stepValore}>{config.occhioSx.nome}</span>}
              </button>
              {stepAttivo === 3 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[3]}</p>
                  <div className={styles.coloriGrid}>
                    {cristalli.map((c) => <ColoreCircle key={c.id} item={c} selezionato={config.occhioSx?.id === c.id} onClick={() => { update({ occhioSx: c }); setStepAttivo(4); }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4 — OCCHIO DX */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 4 ? styles.stepHeaderAttivo : ""}`} onClick={() => stepCompletati[3] && setStepAttivo(4)}>
                <span className={styles.stepNum}>05</span>
                <span className={styles.stepTitolo}>Swarovski Occhio destro</span>
                {config.occhioDx && <span className={styles.stepValore}>{config.occhioDx.nome}</span>}
              </button>
              {stepAttivo === 4 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[4]}</p>
                  <div className={styles.coloriGrid}>
                    {cristalli.map((c) => <ColoreCircle key={c.id} item={c} selezionato={config.occhioDx?.id === c.id} onClick={() => { update({ occhioDx: c }); setStepAttivo(5); }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 5 — CORDINO */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 5 ? styles.stepHeaderAttivo : ""}`} onClick={() => stepCompletati[4] && setStepAttivo(5)}>
                <span className={styles.stepNum}>06</span>
                <span className={styles.stepTitolo}>Cordino</span>
                {config.cordino && <span className={styles.stepValore}>{config.cordino.nome}</span>}
              </button>
              {stepAttivo === 5 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[5]}</p>
                  <div className={styles.coloriGrid}>
                    {cordini.map((c) => <ColoreCircle key={c.id} item={c} selezionato={config.cordino?.id === c.id} onClick={() => { update({ cordino: c }); setStepAttivo(6); }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 6 — DEDICA YOU */}
            <div className={styles.step}>
            <button className={`${styles.stepHeader} ${stepAttivo === 6 ? styles.stepHeaderAttivo : ""}`} onClick={() => stepCompletati[5] && setStepAttivo(6)}>
                <span className={styles.stepNum}>07</span>
                <span className={styles.stepTitolo}>Dedica sul retro <span className={styles.opzionale}>(opzionale)</span></span>
                {config.dedicaHum && <span className={styles.stepValore}>"{config.dedicaHum}"</span>}
            </button>
            {stepAttivo === 6 && (
                <div className={styles.stepBody}>
                <p className={styles.stepDesc}>{STEP_DESC[6]}</p>
                {fonts.length > 0 && (
                    <div className={styles.field}>
                    <label className={styles.fieldLabel}>Stile carattere</label>
                    <div className={styles.sceltaRow}>
                        {fonts.map((f) => (
                        <button key={f.id} className={`${styles.fontBtn} ${config.fontDedicaHum?.id === f.id ? styles.fontBtnSel : ""}`} onClick={() => update({ fontDedicaHum: f })}>
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
                    const maxTotale = font.righe * font.caratteriPerRiga;

                    function handleDedica(val: string) {
                        const righe = val.split("\n");
                        const righeValide = righe
                        .slice(0, font.righe)
                        .map(r => r.slice(0, font.caratteriPerRiga));
                        update({ dedicaHum: righeValide.join("\n") });
                    }

                    return (
                        <>
                        <textarea
                            className={styles.dedicaTextarea}
                            style={{ fontFamily: font.famiglia, fontSize: font.sizePx }}
                            value={config.dedicaHum}
                            rows={font.righe}
                            placeholder={`Max ${font.righe} righe × ${font.caratteriPerRiga} caratteri`}
                            onChange={(e) => handleDedica(e.target.value)}
                        />
                        <p className={styles.hint}>
                            {config.dedicaHum.replace(/\n/g, "").length}/{maxTotale} caratteri
                            {impostazioni.prezzoDedica > 0 && ` — supplemento €${impostazioni.prezzoDedica}`}
                        </p>
                        </>
                    );
                    })()}
                </div>
                <button className={styles.nextBtn} onClick={() => setStepAttivo(7)}>Continua →</button>
                </div>
            )}
            </div>

            {/* STEP 7 — PET */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 7 ? styles.stepHeaderAttivo : ""}`} onClick={() => setStepAttivo(7)}>
                <span className={styles.stepNum}>08</span>
                <span className={styles.stepTitolo}>Aggiungi ciondolo PET <span className={styles.opzionale}>(opzionale)</span></span>
                {config.aggiungPet && <span className={styles.stepValore}>Sì</span>}
              </button>
              {stepAttivo === 7 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[7]}</p>
                  <div className={styles.sceltaRow}>
                    <button className={`${styles.sceltaBtn} ${!config.aggiungPet ? styles.sceltaBtnSel : ""}`} onClick={() => { update({ aggiungPet: false }); setStepAttivo(8); }}>No grazie</button>
                    <button className={`${styles.sceltaBtn} ${config.aggiungPet ? styles.sceltaBtnSel : ""}`} onClick={() => { update({ aggiungPet: true }); setStepAttivo(8); }}>Sì, aggiungi PET</button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 8 — CONFIG PET */}
            {config.aggiungPet && (
            <div className={styles.step}>
                <button className={`${styles.stepHeader} ${stepAttivo === 8 ? styles.stepHeaderAttivo : ""}`} onClick={() => setStepAttivo(8)}>
                <span className={styles.stepNum}>09</span>
                <span className={styles.stepTitolo}>Configura il PET</span>
                </button>
                {stepAttivo === 8 && (
                <PetConfig
                    config={config}
                    cristalli={cristalli}
                    fonts={fonts}
                    impostazioni={impostazioni}
                    update={update}
                    onContinua={() => setStepAttivo(9)}
                />
                )}
            </div>
            )}

            {/* STEP 9 — CONFEZIONE */}
            <div className={styles.step}>
              <button className={`${styles.stepHeader} ${stepAttivo === 9 ? styles.stepHeaderAttivo : ""}`} onClick={() => setStepAttivo(9)}>
                <span className={styles.stepNum}>{config.aggiungPet ? "10" : "09"}</span>
                <span className={styles.stepTitolo}>Confezione</span>
                {config.confezione && <span className={styles.stepValore}>{config.confezione.nome}</span>}
              </button>
              {stepAttivo === 9 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[9]}</p>
                  <div className={styles.confezioniGrid}>
                    {confezioni.map((c) => (
                      <button key={c.id} className={`${styles.confezioneCard} ${config.confezione?.id === c.id ? styles.confezioneCardSel : ""}`} onClick={() => update({ confezione: c })}>
                        {c.immagini?.[0] && <div className={styles.confezioneImg}><img src={c.immagini[0]} alt={c.nome} /></div>}
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

              <div className={styles.anteprima}>
                {config.animale ? (
                  (config.animale.immagineForma || config.animale.immagineDisegno) ? (
                    <img src={config.animale.immagineForma || config.animale.immagineDisegno} alt={config.animale.nome} className={styles.anteprimaImg} />
                  ) : (
                    <div className={styles.anteprimaPlaceholder}><span>{config.animale.nome}</span></div>
                  )
                ) : (
                  <div className={styles.anteprimaPlaceholder}><span>2dots</span></div>
                )}
              </div>

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
                    <div className={styles.riepilogoColore}>
                        <div className={styles.riepilogoColoreDot} style={{ background: ciondoloGradient(config.coloreCiondolo) }} />
                        <span className={styles.riepilogoValore}>{config.coloreCiondolo === "nero" ? "Nero" : "Bianco"}</span>
                    </div>
                    </div>
                )}
                {config.smalto && (
                    <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Disegno</span>
                    <div className={styles.riepilogoColore}>
                        <RiepilogoColore item={config.smalto} />
                        <span className={styles.riepilogoValore}>{config.smalto.nome}</span>
                    </div>
                    </div>
                )}
                {config.occhioSx && (
                    <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Swarovski sx</span>
                    <div className={styles.riepilogoColore}>
                        <RiepilogoColore item={config.occhioSx} />
                        <span className={styles.riepilogoValore}>{config.occhioSx.nome}</span>
                    </div>
                    </div>
                )}
                {config.occhioDx && (
                    <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Swarovski dx</span>
                    <div className={styles.riepilogoColore}>
                        <RiepilogoColore item={config.occhioDx} />
                        <span className={styles.riepilogoValore}>{config.occhioDx.nome}</span>
                    </div>
                    </div>
                )}
                {config.cordino && (
                    <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Cordino</span>
                    <div className={styles.riepilogoColore}>
                        <RiepilogoColore item={config.cordino} />
                        <span className={styles.riepilogoValore}>{config.cordino.nome}</span>
                    </div>
                    </div>
                )}
                {config.dedicaHum && (
                    <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Dedica</span>
                    <span className={styles.riepilogoValore}>"{config.dedicaHum}"</span>
                    </div>
                )}
                {config.aggiungPet && (
                    <>
                    <div className={styles.riepilogoDivider} />
                    {config.coloreCiondoloPet && (
                        <div className={styles.riepilogoRiga}>
                        <span className={styles.riepilogoLabel}>PET ciondolo</span>
                        <div className={styles.riepilogoColore}>
                            <div className={styles.riepilogoColoreDot} style={{ background: ciondoloGradient(config.coloreCiondoloPet) }} />
                            <span className={styles.riepilogoValore}>{config.coloreCiondoloPet === "nero" ? "Nero" : "Bianco"}</span>
                        </div>
                        </div>
                    )}
                    {config.occhioSxPet && (
                        <div className={styles.riepilogoRiga}>
                        <span className={styles.riepilogoLabel}>PET Swar. sx</span>
                        <div className={styles.riepilogoColore}>
                            <RiepilogoColore item={config.occhioSxPet} />
                            <span className={styles.riepilogoValore}>{config.occhioSxPet.nome}</span>
                        </div>
                        </div>
                    )}
                    {config.occhioDxPet && (
                        <div className={styles.riepilogoRiga}>
                        <span className={styles.riepilogoLabel}>PET Swar. dx</span>
                        <div className={styles.riepilogoColore}>
                            <RiepilogoColore item={config.occhioDxPet} />
                            <span className={styles.riepilogoValore}>{config.occhioDxPet.nome}</span>
                        </div>
                        </div>
                    )}
                    {config.dedicaPet && (
                        <div className={styles.riepilogoRiga}>
                        <span className={styles.riepilogoLabel}>PET dedica</span>
                        <span className={styles.riepilogoValore}>"{config.dedicaPet}"</span>
                        </div>
                    )}
                    </>
                )}
                {config.confezione && (
                    <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Confezione</span>
                    <span className={styles.riepilogoValore}>{config.confezione.nome}</span>
                    </div>
                )}
            </div>

            <div className={styles.prezzoBox}>
              <div className={styles.prezzoRiga}><span>YOU</span><span>€{prezzoHum}</span></div>
              {config.aggiungPet && <div className={styles.prezzoRiga}><span>PET</span><span>€{prezzoPet}</span></div>}
              {config.dedicaHum && impostazioni.prezzoDedica > 0 && (
                <div className={styles.prezzoRiga}><span>Dedica YOU</span><span>€{impostazioni.prezzoDedica}</span></div>
              )}
              {config.dedicaPet.trim() !== "" && (impostazioni.prezzoDedicaPet || 0) > 0 && (
                <div className={styles.prezzoRiga}><span>Dedica PET</span><span>€{impostazioni.prezzoDedicaPet}</span></div>
              )}
              {prezzoConfezione > 0 && <div className={styles.prezzoRiga}><span>Confezione</span><span>€{prezzoConfezione}</span></div>}
              <div className={styles.prezzoTotale}><span>Totale</span><span>€{totale}</span></div>
            </div>

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
