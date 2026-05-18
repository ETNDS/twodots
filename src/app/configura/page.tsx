"use client";

import { useEffect, useState, Suspense } from "react";

import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getAnimaliPubblicati, Animale } from "@/lib/animali";
import { getCristalli, getCordini, getSmalti, getFontDedica, getConfezioni, getImpostazioni, getPetCiondolo, ItemColore, FontDedica, Confezione, Impostazioni, PetCiondolo } from "@/lib/configuratore";
import styles from "@styles/configura.module.css";
import { useCarrello } from "@/lib/carrello";
import Viewer3D from "@/components/Viewer3D";
import Dialog from "@/components/Dialog";

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
  quantita: number;
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
  quantita: 1,
};

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
  10: "Quante copie di questo bijoux vuoi aggiungere al carrello?",
};

function ciondoloGradient(colore: "nero" | "bianco"): string {
  if (colore === "nero") return "radial-gradient(ellipse at 50% 30%, #888 0%, #1a1a1a 50%, #000 100%)";
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
        <div className={styles.coloreCircleInner} style={{ background: coloreGradient(item.coloreCSS) }} />
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
  if (img) return <img src={img} alt={item.nome} className={styles.riepilogoImg} />;
  return <div className={styles.riepilogoColoreDot} style={{ background: coloreGradient(item.coloreCSS) }} />;
}

// ── POPUP PREVIEW FONT ──────────────────────────────────────────────────────
function FontPreviewPopup({ testo, font, onClose }: { testo: string; font: FontDedica; onClose: () => void }) {
  const righe = testo.split("\n");
  const [fontPronto, setFontPronto] = useState(false);

  useEffect(() => {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.famiglia)}:wght@400;500;700&display=swap`;
    const id = `gfont-${font.famiglia.replace(/\s+/g, "-").toLowerCase()}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
    document.fonts.load(`400 16px "${font.famiglia}"`).then(() => setFontPronto(true));
  }, [font.famiglia]);

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.fontPreviewPopup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.fontPreviewHeader}>
          <span className={styles.fontPreviewTitolo}>Anteprima della dedica</span>
          <button className={styles.popupClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.fontPreviewArea}>
          {fontPronto ? (
            <div className={styles.fontPreviewTesto} style={{ fontFamily: font.famiglia, fontSize: "20px" }}>
              {righe.map((r, i) => (
                <div key={i}>{r || "\u00A0"}</div>
              ))}
            </div>
          ) : (
            <div className={styles.fontPreviewTesto} style={{ opacity: 0.3, fontSize: "13px" }}>
              Caricamento font...
            </div>
          )}
        </div>
        <p className={styles.fontPreviewFamiglia}>Font: {font.famiglia}</p>
        <p className={styles.fontPreviewHint}>
          L'incisione fisica sarà proporzionalmente più piccola.
        </p>
      </div>
    </div>
  );
}

// ── MODULO PREVENTIVO ────────────────────────────────────────────────────────
function ModuloPreventivo({ maxPezzi, onClose }: { maxPezzi: number; onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [pezzi, setPezzi] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [inviando, setInviando] = useState(false);
  const [inviato, setInviato] = useState(false);
  const [errore, setErrore] = useState("");

  async function handleInvia() {
    if (!nome.trim() || !email.trim() || !messaggio.trim()) {
      setErrore("Compila tutti i campi obbligatori.");
      return;
    }
    setErrore("");
    setInviando(true);
    try {
      const res = await fetch("/api/preventivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefono, pezzi, messaggio }),
      });
      if (res.ok) {
        setInviato(true);
      } else {
        setErrore("Errore nell'invio. Riprova.");
      }
    } catch {
      setErrore("Errore nell'invio. Riprova.");
    } finally {
      setInviando(false);
    }
  }

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.preventivoPopup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <h3 className={styles.popupNome}>Richiedi un preventivo</h3>
          <button className={styles.popupClose} onClick={onClose}>×</button>
        </div>

        {inviato ? (
          <div className={styles.preventivoSuccesso}>
            <p>✓ Richiesta inviata!</p>
            <p className={styles.preventivoSuccessoSub}>Ti risponderemo all'indirizzo indicato.</p>
            <button className={styles.nextBtn} onClick={onClose}>Chiudi</button>
          </div>
        ) : (
          <>
            <p className={styles.preventivoIntro}>
              Per ordini superiori a {maxPezzi} pezzi contattaci — ti prepariamo un preventivo su misura.
            </p>

            <div className={styles.preventivoForm}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nome *</label>
                <input className={styles.preventivoInput} type="text" value={nome}
                  onChange={(e) => setNome(e.target.value)} placeholder="Il tuo nome" />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email *</label>
                <input className={styles.preventivoInput} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="La tua email" />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Telefono</label>
                <input className={styles.preventivoInput} type="tel" value={telefono}
                  onChange={(e) => setTelefono(e.target.value)} placeholder="Opzionale" />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Numero di pezzi indicativo</label>
                <input className={styles.preventivoInput} type="number" min={maxPezzi + 1} value={pezzi}
                  onChange={(e) => setPezzi(e.target.value)} placeholder={`Es. ${maxPezzi + 5}`} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Descrivi la tua richiesta *</label>
                <textarea className={styles.preventivoTextarea} rows={4} value={messaggio}
                  onChange={(e) => setMessaggio(e.target.value)}
                  placeholder="Raccontaci cosa ti serve: animali, personalizzazioni, confezioni speciali..." />
              </div>

              {errore && <p className={styles.preventivoErrore}>{errore}</p>}

              <button className={styles.nextBtn} onClick={handleInvia} disabled={inviando}>
                {inviando ? "Invio in corso..." : "Invia richiesta"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── BANNER LIMITE RAGGIUNTO ──────────────────────────────────────────────────
function BannerLimiteRaggiunto({ maxPezzi, onPreventivo }: { maxPezzi: number; onPreventivo: () => void }) {
  return (
    <div className={styles.bannerLimite}>
      <div className={styles.bannerLimiteIcona}>⚑</div>
      <div className={styles.bannerLimiteTesto}>
        <strong>Hai raggiunto il massimo di {maxPezzi} pezzi per ordine online.</strong>
        <span> Per quantità maggiori puoi richiedere un preventivo.</span>
      </div>
      <button className={styles.bannerLimiteBtn} onClick={onPreventivo}>
        Richiedi preventivo
      </button>
    </div>
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
  const [showPreviewPet, setShowPreviewPet] = useState(false);

  const fontPet = config.fontDedicaPet || config.fontDedicaHum || fonts[0];

  return (
    <div className={styles.stepBody}>

      <div className={styles.step}>
        <button className={`${styles.stepHeader} ${subStep === 0 ? styles.stepHeaderAttivo : ""}`} onClick={() => setSubStep(0)}>
          <span className={styles.stepNum}>a</span>
          <span className={styles.stepTitolo}>Colore ciondolo PET</span>
          {config.coloreCiondoloPet && <span className={styles.stepValore}>{config.coloreCiondoloPet === "nero" ? "Nero" : "Bianco"}</span>}
        </button>
        {subStep === 0 && (
          <div className={styles.stepBody}>
            <div className={styles.sceltaRow}>
              {(["nero", "bianco"] as const).map((c) => (
                <button key={c} className={`${styles.coloreCiondoloBtn} ${config.coloreCiondoloPet === c ? styles.coloreCiondoloBtnSel : ""}`}
                  onClick={() => { update({ coloreCiondoloPet: c }); setSubStep(1); }}>
                  <div className={styles.coloreCiondoloBall} style={{ background: ciondoloGradient(c) }} />
                  <span className={styles.coloreCiondoloNome}>{c === "nero" ? "Nero" : "Bianco"}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.step}>
        <button className={`${styles.stepHeader} ${subStep === 1 ? styles.stepHeaderAttivo : ""}`} onClick={() => config.coloreCiondoloPet && setSubStep(1)}>
          <span className={styles.stepNum}>b</span>
          <span className={styles.stepTitolo}>Swarovski Occhio sinistro PET</span>
          {config.occhioSxPet && <span className={styles.stepValore}>{config.occhioSxPet.nome}</span>}
        </button>
        {subStep === 1 && (
          <div className={styles.stepBody}>
            <div className={styles.coloriGrid}>
              {cristalli.map((c) => <ColoreCircle key={c.id} item={c} selezionato={config.occhioSxPet?.id === c.id} onClick={() => { update({ occhioSxPet: c }); setSubStep(2); }} />)}
            </div>
          </div>
        )}
      </div>

      <div className={styles.step}>
        <button className={`${styles.stepHeader} ${subStep === 2 ? styles.stepHeaderAttivo : ""}`} onClick={() => config.occhioSxPet && setSubStep(2)}>
          <span className={styles.stepNum}>c</span>
          <span className={styles.stepTitolo}>Swarovski Occhio destro PET</span>
          {config.occhioDxPet && <span className={styles.stepValore}>{config.occhioDxPet.nome}</span>}
        </button>
        {subStep === 2 && (
          <div className={styles.stepBody}>
            <div className={styles.coloriGrid}>
              {cristalli.map((c) => <ColoreCircle key={c.id} item={c} selezionato={config.occhioDxPet?.id === c.id} onClick={() => { update({ occhioDxPet: c }); setSubStep(3); }} />)}
            </div>
          </div>
        )}
      </div>

      <div className={styles.step}>
        <button className={`${styles.stepHeader} ${subStep === 3 ? styles.stepHeaderAttivo : ""}`} onClick={() => config.occhioDxPet && setSubStep(3)}>
          <span className={styles.stepNum}>d</span>
          <span className={styles.stepTitolo}>Dedica PET <span className={styles.opzionale}>(opzionale)</span></span>
          {config.dedicaPet && <span className={styles.stepValore}>"{config.dedicaPet}"</span>}
        </button>
        {subStep === 3 && (
          <div className={styles.stepBody}>
            {fonts.length > 0 && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Stile carattere</label>
                <div className={styles.fontGrid}>
                  {fonts.map((f) => (
                    <button key={f.id} className={`${styles.fontCard} ${fontPet?.id === f.id ? styles.fontCardSel : ""}`} onClick={() => update({ fontDedicaPet: f })}>
                      <span className={styles.fontCardNome}>{f.descrizione}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {fontPet && (() => {
              const font = fontPet;
              const maxTotale = font.righe * font.caratteriPerRiga;
              function handleDedicaPet(val: string) {
                const righe = val.split("\n");
                const righeValide = righe.slice(0, font.righe).map(r => r.slice(0, font.caratteriPerRiga));
                update({ dedicaPet: righeValide.join("\n") });
              }
              return (
                <>
                  <div className={styles.dedicaWrapper}>
                    <textarea className={styles.dedicaTextarea} 
                      value={config.dedicaPet} rows={2}
                      onChange={(e) => handleDedicaPet(e.target.value)} />
                    {!config.dedicaPet && (
                      <span className={styles.dedicaPlaceholder}>
                        Max {font.righe} righe × {font.caratteriPerRiga} caratteri
                      </span>
                    )}
                  </div>
                  <div className={styles.dedicaHintRow}>
                    <p className={styles.hint}>{config.dedicaPet.replace(/\n/g, "").length}/{maxTotale} caratteri</p>
                    {config.dedicaPet.trim() && (
                      <button className={styles.previewFontBtn} onClick={() => setShowPreviewPet(true)}>
                        Anteprima testo
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <button className={styles.nextBtn} onClick={onContinua}>Continua →</button>

      {showPreviewPet && fontPet && config.dedicaPet.trim() && (
        <FontPreviewPopup testo={config.dedicaPet} font={fontPet} onClose={() => setShowPreviewPet(false)} />
      )}
    </div>
  );
}

function ConfiguraInner() {
  const searchParams = useSearchParams();
  const animaleParam = searchParams.get("animale");
  const resetParam = searchParams.get("reset");
  const router = useRouter();
  const { aggiungi, totalePezzi } = useCarrello();

  const [config, setConfig] = useState<Configurazione>(EMPTY);
  const [stepAttivo, setStepAttivo] = useState(animaleParam ? 1 : 0);
  const [loading, setLoading] = useState(true);
  const [animali, setAnimali] = useState<Animale[]>([]);
  const [cristalli, setCristalli] = useState<ItemColore[]>([]);
  const [cordini, setCordini] = useState<ItemColore[]>([]);
  const [smalti, setSmalti] = useState<ItemColore[]>([]);
  const [fonts, setFonts] = useState<FontDedica[]>([]);
  const [confezioni, setConfezioni] = useState<Confezione[]>([]);
  const [impostazioni, setImpostazioni] = useState<Impostazioni>({ prezzoBase: 45, prezzoPet: 15, prezzoDedica: 0, prezzoDedicaPet: 0, maxPezzi: 5 });
  const [aggiungendo, setAggiungendo] = useState(false);
  const [petCiondolo, setPetCiondolo] = useState<PetCiondolo | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPreviewHum, setShowPreviewHum] = useState(false);
  const [showPreventivo, setShowPreventivo] = useState(false);

  useEffect(() => {
    if (resetParam === "1") {
      setConfig(EMPTY);
      setStepAttivo(0);
      router.replace("/configura");
    }
  }, [resetParam]);

  useEffect(() => {
    if (stepAttivo === null || stepAttivo === undefined) return;
    const el = document.getElementById(`step-${stepAttivo}`);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [stepAttivo]);

  useEffect(() => {
    async function carica() {
      const [a, cr, co, sm, fo, conf, imp, pet] = await Promise.all([
        getAnimaliPubblicati(), getCristalli(), getCordini(), getSmalti(), getFontDedica(), getConfezioni(), getImpostazioni(), getPetCiondolo(),
      ]);
      setAnimali(a);
      setCristalli(cr.filter(x => x.attivo));
      setCordini(co.filter(x => x.attivo));
      setSmalti(sm.filter(x => x.attivo));
      setFonts(fo.filter(x => x.attivo));
      setConfezioni(conf.filter(x => x.attivo));
      setImpostazioni(imp);
      setPetCiondolo(pet);
      if (animaleParam) {
        const trovato = a.find(x => x.id === animaleParam);
        if (trovato) setConfig(p => ({ ...p, animale: trovato }));
      }
      setLoading(false);
    }
    carica();
  }, [animaleParam]);

  function update(partial: Partial<Configurazione>) {
    setConfig(p => {
      const next = { ...p, ...partial };

      // ── PUNTO 1: prezzo incisione PET segue incisione HUM ──────────────────
      // Se stiamo modificando dedicaHum o fontDedicaHum, aggiorniamo anche
      // il prezzo della dedica PET (gestito implicitamente dalla logica prezzi
      // che usa impostazioni.prezzoDedicaPet vs impostazioni.prezzoDedica).
      // Non serve stato extra: il calcolo del totale usa già i prezzi corretti.
      // La logica è in prezzoIncisionePet qui sotto.

      return next;
    });
  }

  function reset() {
    setShowResetDialog(true);
  }

  // ── PUNTO 1: prezzo incisione PET ────────────────────────────────────────
  // Se c'è dedica HUM → incisione PET al prezzo scontato (prezzoDedicaPet)
  // Se NON c'è dedica HUM → incisione PET al prezzo intero (prezzoDedica)
  const hasDedicaHum = config.dedicaHum.trim() !== "";
  const prezzoDedicaPetEffettivo = hasDedicaHum
    ? (impostazioni.prezzoDedicaPet || 0)
    : (impostazioni.prezzoDedica || 0);

  const prezzoHum = config.animale ? (config.animale.prezzo || impostazioni.prezzoBase) : 0;
  const prezzoPet = config.aggiungPet ? (config.animale?.prezzoPet || impostazioni.prezzoPet) : 0;
  const prezzoConfezione = config.confezione?.prezzo || 0;
  const prezzoDedicaHumCalc = config.dedicaHum.trim() ? (impostazioni.prezzoDedica || 0) : 0;
  const prezzoDedicaPetCalc = config.dedicaPet.trim() ? prezzoDedicaPetEffettivo : 0;
  const prezzoDedica = prezzoDedicaHumCalc + prezzoDedicaPetCalc;
  const totalePerPezzo = prezzoHum + prezzoPet + prezzoConfezione + prezzoDedica;
  const totale = totalePerPezzo * config.quantita;

  // ── PUNTO 2/3: quantità disponibile ──────────────────────────────────────
  const pezziDisponibili = impostazioni.maxPezzi - totalePezzi;
  const limiteMassimo = pezziDisponibili <= 0;

  async function handleAggiungiAlCarrello() {
    if (!tuttiCompletati) return;
    setAggiungendo(true);
    try {
      aggiungi({
        id: Date.now().toString(),
        animale: config.animale!,
        coloreCiondolo: config.coloreCiondolo!,
        smalto: config.smalto!,
        occhioSx: config.occhioSx!,
        occhioDx: config.occhioDx!,
        cordino: config.cordino!,
        dedicaHum: config.dedicaHum,
        fontDedicaHum: config.fontDedicaHum,
        aggiungPet: config.aggiungPet,
        coloreCiondoloPet: config.coloreCiondoloPet,
        occhioSxPet: config.occhioSxPet,
        occhioDxPet: config.occhioDxPet,
        dedicaPet: config.dedicaPet,
        fontDedicaPet: config.fontDedicaPet,
        confezione: config.confezione!,
        quantita: config.quantita,
        prezzoTotale: totalePerPezzo,
      });
      router.push("/carrello");
    } catch (e) {
      console.error(e);
      alert("Errore. Riprova.");
    } finally {
      setAggiungendo(false);
    }
  }

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
    10: config.quantita >= 1,
  };

  const tuttiCompletati = Object.values(stepCompletati).every(Boolean) && !!config.animale && !!config.coloreCiondolo && !!config.smalto && !!config.occhioSx && !!config.occhioDx && !!config.cordino && !!config.confezione;

  const fontHum = config.fontDedicaHum || fonts[0];

  const show3DViewer = !!(config.animale?.modello3D && config.coloreCiondolo && config.smalto && config.occhioSx && config.occhioDx);

  if (loading) return (
    <>
      <BackgroundLogo /><Navbar />
      <main className={styles.main}><p className={styles.loading}>Caricamento...</p></main>
      <Footer />
    </>
  );

  // ── PUNTO 4: se limite già raggiunto, non mostrare il configuratore ──────
  if (limiteMassimo) {
    return (
      <>
        <BackgroundLogo />
        <Navbar />
        <main className={styles.main}>
          <div className={styles.intro}>
            <p className={styles.introLabel}>CONFIGURA</p>
            <h1 className={styles.introTitolo}>Crea il tuo bijoux</h1>
          </div>
          <div className={styles.limitePagina}>
            <div className={styles.limitePaginaIcona}>⚑</div>
            <p className={styles.limitePaginaTitolo}>
              Hai raggiunto il massimo di {impostazioni.maxPezzi} pezzi per ordine online.
            </p>
            <p className={styles.limitePaginaSub}>
              Per ordini più grandi ti prepariamo un preventivo su misura.
            </p>
            <div className={styles.limitePaginaBtns}>
              <button className={styles.ctaBtnPrimary} onClick={() => setShowPreventivo(true)}>
                Richiedi preventivo
              </button>
              <button className={styles.linkBtn} onClick={() => router.push("/carrello")}>
                Vai al carrello
              </button>
            </div>
          </div>
        </main>
        <Footer />
        {showPreventivo && (
          <ModuloPreventivo maxPezzi={impostazioni.maxPezzi} onClose={() => setShowPreventivo(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.introLabel}>CONFIGURA</p>
          <div className={styles.introRow}>
            <h1 className={styles.introTitolo}>Crea il tuo bijoux</h1>
            {!Object.values(config).every(v => v === null || v === false || v === "" || v === 1) && (
              <button className={styles.resetBtn} onClick={reset}>Ricomincia</button>
            )}
          </div>
        </div>

        {/* ── PUNTO 4: banner limite raggiunto ── */}
        {limiteMassimo && (
          <BannerLimiteRaggiunto maxPezzi={impostazioni.maxPezzi} onPreventivo={() => setShowPreventivo(true)} />
        )}

        <div className={styles.layout}>
          <div className={styles.steps}>

            <div className={styles.step} id="step-0">
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

            <div className={styles.step} id="step-1">
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

            <div className={styles.step} id="step-2">
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

            <div className={styles.step} id="step-3">
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

            <div className={styles.step} id="step-4">
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

            <div className={styles.step} id="step-5">
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

            <div className={styles.step} id="step-6">
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
                      <div className={styles.fontGrid}>
                        {fonts.map((f) => (
                          <button key={f.id} className={`${styles.fontCard} ${config.fontDedicaHum?.id === f.id ? styles.fontCardSel : ""}`} onClick={() => update({ fontDedicaHum: f })}>
                            <span className={styles.fontCardNome}>{f.descrizione}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Testo dedica</label>
                    {fontHum && (() => {
                      const font = fontHum;
                      const maxTotale = font.righe * font.caratteriPerRiga;
                      function handleDedica(val: string) {
                        const righe = val.split("\n");
                        const righeValide = righe.slice(0, font.righe).map(r => r.slice(0, font.caratteriPerRiga));
                        update({ dedicaHum: righeValide.join("\n") });
                      }
                      return (
                        <>
                          <div className={styles.dedicaWrapper}>
                            <textarea className={styles.dedicaTextarea} 
                              value={config.dedicaHum} rows={2}
                              onChange={(e) => handleDedica(e.target.value)} />
                            {!config.dedicaHum && (
                              <span className={styles.dedicaPlaceholder}>
                                Max {font.righe} righe × {font.caratteriPerRiga} caratteri
                              </span>
                            )}
                          </div>
                          <div className={styles.dedicaHintRow}>
                            <p className={styles.hint}>
                              {config.dedicaHum.replace(/\n/g, "").length}/{maxTotale} caratteri
                              {impostazioni.prezzoDedica > 0 && ` — supplemento €${impostazioni.prezzoDedica}`}
                            </p>
                            {/* ── PUNTO 6: bottone preview font ── */}
                            {config.dedicaHum.trim() && (
                              <button className={styles.previewFontBtn} onClick={() => setShowPreviewHum(true)}>
                                Anteprima testo
                              </button>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <button className={styles.nextBtn} onClick={() => setStepAttivo(7)}>Continua →</button>
                </div>
              )}
            </div>

            <div className={styles.step} id="step-7">
              <button className={`${styles.stepHeader} ${stepAttivo === 7 ? styles.stepHeaderAttivo : ""}`} onClick={() => setStepAttivo(7)}>
                <span className={styles.stepNum}>08</span>
                <span className={styles.stepTitolo}>Aggiungi ciondolo PET <span className={styles.opzionale}>(opzionale)</span></span>
                {config.aggiungPet && <span className={styles.stepValore}>Sì</span>}
              </button>
              {stepAttivo === 7 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[7]}</p>
                  <div className={styles.sceltaRow}>
                    <button className={`${styles.sceltaBtn} ${!config.aggiungPet ? styles.sceltaBtnSel : ""}`} onClick={() => { update({ aggiungPet: false }); setStepAttivo(9); }}>No grazie</button>
                    <button className={`${styles.sceltaBtn} ${config.aggiungPet ? styles.sceltaBtnSel : ""}`} onClick={() => { update({ aggiungPet: true }); setStepAttivo(8); }}>Sì, aggiungi PET</button>
                  </div>
                </div>
              )}
            </div>

            {config.aggiungPet && (
              <div className={styles.step} id="step-8">
                <button className={`${styles.stepHeader} ${stepAttivo === 8 ? styles.stepHeaderAttivo : ""}`} onClick={() => setStepAttivo(8)}>
                  <span className={styles.stepNum}>09</span>
                  <span className={styles.stepTitolo}>Configura il PET</span>
                </button>
                {stepAttivo === 8 && (
                  <PetConfig config={config} cristalli={cristalli} fonts={fonts} impostazioni={impostazioni} update={update} onContinua={() => setStepAttivo(9)} />
                )}
              </div>
            )}

            <div className={styles.step} id="step-9">
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
                      <button key={c.id} className={`${styles.confezioneCard} ${config.confezione?.id === c.id ? styles.confezioneCardSel : ""}`} onClick={() => { update({ confezione: c }); setTimeout(() => setStepAttivo(10), 100); }}>
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

            {/* ── PUNTO 3: step quantità ── */}
            <div className={styles.step} id="step-10">
              <button className={`${styles.stepHeader} ${stepAttivo === 10 ? styles.stepHeaderAttivo : ""}`} onClick={() => stepCompletati[9] && setStepAttivo(10)}>
                <span className={styles.stepNum}>{config.aggiungPet ? "11" : "10"}</span>
                <span className={styles.stepTitolo}>Quantità</span>
                {config.quantita > 1 && <span className={styles.stepValore}>× {config.quantita}</span>}
              </button>
              {stepAttivo === 10 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepDesc}>{STEP_DESC[10]}</p>
                  <div className={styles.quantitaRow}>
                    <button className={styles.quantitaBtn}
                      disabled={config.quantita <= 1}
                      onClick={() => update({ quantita: Math.max(1, config.quantita - 1) })}>
                      −
                    </button>
                    <span className={styles.quantitaValore}>{config.quantita}</span>
                    <button className={styles.quantitaBtn}
                      disabled={config.quantita >= pezziDisponibili}
                      onClick={() => update({ quantita: Math.min(pezziDisponibili, config.quantita + 1) })}>
                      +
                    </button>
                  </div>
                  {pezziDisponibili < impostazioni.maxPezzi && (
                    <p className={styles.hint}>
                      Puoi aggiungere ancora {pezziDisponibili} {pezziDisponibili === 1 ? "pezzo" : "pezzi"} su {impostazioni.maxPezzi} max.
                      {" "}<button className={styles.linkBtn} onClick={() => setShowPreventivo(true)}>Servono di più?</button>
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* COLONNA DESTRA — RIEPILOGO */}
          <div className={styles.riepilogo}>
            <div className={styles.riepilogoInner}>

              {/* ── PUNTO 5: anteprima YOU con label 3D ── */}
              <div className={styles.anteprimaWrapper}>
                <div className={styles.anteprima}>
                  {show3DViewer ? (
                    <Viewer3D
                      glbUrl={config.animale!.modello3D!}
                      coloreCiondolo={config.coloreCiondolo!}
                      coloreDisegno={config.smalto!.coloreCSS}
                      coloreOcchioSx={config.occhioSx!.coloreCSS}
                      coloreOcchioDx={config.occhioDx!.coloreCSS}
                      immagineOcchioSx={config.occhioSx!.immagini?.[0] || null}
                      immagineOcchioDx={config.occhioDx!.immagini?.[0] || null}
                      occhioSxPos={config.animale!.occhioSxPos || null}
                      occhioDxPos={config.animale!.occhioDxPos || null}
                    />
                  ) : config.animale ? (
                    (config.animale.immagineForma || config.animale.immagineDisegno) ? (
                      <img src={config.animale.immagineForma || config.animale.immagineDisegno} alt={config.animale.nome} className={styles.anteprimaImg} />
                    ) : (
                      <div className={styles.anteprimaPlaceholder}><span>{config.animale.nome}</span></div>
                    )
                  ) : (
                    <div className={styles.anteprimaPlaceholder}><span>2dots</span></div>
                  )}
                  {!!config.animale && (
                    <div className={styles.watermark3D}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i}>2DOTS·2DOTS·2DOTS·2DOTS</span>
                      ))}
                    </div>
                  )}
                  {show3DViewer && (
                    <div className={styles.label3D}>↺ ruota</div>
                  )}
                </div>
              </div>

              {/* DETTAGLI YOU */}
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

                {/* SEZIONE PET */}
                {config.aggiungPet && (
                  <>
                    <div className={styles.riepilogoDivider} />

                    {/* ANTEPRIMA PET con label 3D */}
                    {petCiondolo && (() => {
                      const show3DPet = !!(petCiondolo.modello3D && config.coloreCiondoloPet && config.occhioSxPet && config.occhioDxPet);
                      return (
                        <div className={styles.anteprimaWrapper}>
                          <div className={styles.anteprima}>
                            {show3DPet ? (
                              <Viewer3D
                                glbUrl={petCiondolo.modello3D}
                                coloreCiondolo={config.coloreCiondoloPet!}
                                coloreDisegno={null}
                                coloreOcchioSx={config.occhioSxPet!.coloreCSS}
                                coloreOcchioDx={config.occhioDxPet!.coloreCSS}
                                immagineOcchioSx={config.occhioSxPet!.immagini?.[0] || null}
                                immagineOcchioDx={config.occhioDxPet!.immagini?.[0] || null}
                                occhioSxPos={petCiondolo.occhioSxPos}
                                occhioDxPos={petCiondolo.occhioDxPos}
                              />
                            ) : petCiondolo.immagineForma ? (
                              <img src={petCiondolo.immagineForma} alt="PET" className={styles.anteprimaImg} />
                            ) : (
                              <div className={styles.anteprimaPlaceholder}><span>PET</span></div>
                            )}
                            <div className={styles.watermark3D}>
                              {Array.from({ length: 6 }).map((_, i) => (
                                <span key={i}>2DOTS·2DOTS·2DOTS·2DOTS</span>
                              ))}
                            </div>
                            {show3DPet && (
                              <div className={styles.label3D}>↺ ruota</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

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
                {config.dedicaPet.trim() !== "" && prezzoDedicaPetEffettivo > 0 && (
                  <div className={styles.prezzoRiga}>
                    <span>Dedica PET{hasDedicaHum ? " (sconto)" : ""}</span>
                    <span>€{prezzoDedicaPetEffettivo}</span>
                  </div>
                )}
                {prezzoConfezione > 0 && <div className={styles.prezzoRiga}><span>Confezione</span><span>€{prezzoConfezione}</span></div>}
                {config.quantita > 1 && (
                  <div className={styles.prezzoRiga}><span>× {config.quantita} pezzi</span><span>€{totalePerPezzo} cad.</span></div>
                )}
                <div className={styles.prezzoTotale}><span>Totale</span><span>€{totale}</span></div>
              </div>

              <button className={styles.ctaBtn} disabled={!tuttiCompletati || aggiungendo || limiteMassimo} onClick={handleAggiungiAlCarrello}>
                {aggiungendo ? "Preparazione..." : limiteMassimo ? "Limite raggiunto" : tuttiCompletati ? "Aggiungi al carrello" : "Completa la configurazione"}
              </button>

              {limiteMassimo && (
                <button className={styles.preventivoInlineBtn} onClick={() => setShowPreventivo(true)}>
                  Richiedi preventivo per quantità maggiori
                </button>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showResetDialog && (
        <Dialog
          titolo="Ricominciare?"
          testo="Perderai tutte le scelte fatte finora."
          confermaTesto="Sì, ricomincia"
          annullaTesto="Annulla"
          onConferma={() => { setShowResetDialog(false); setConfig(EMPTY); setStepAttivo(0); }}
          onAnnulla={() => setShowResetDialog(false)}
        />
      )}

      {/* ── PUNTO 6: popup preview font HUM ── */}
      {showPreviewHum && fontHum && config.dedicaHum.trim() && (
        <FontPreviewPopup testo={config.dedicaHum} font={fontHum} onClose={() => setShowPreviewHum(false)} />
      )}

      {/* ── PUNTO 2: modulo preventivo ── */}
      {showPreventivo && (
        <ModuloPreventivo maxPezzi={impostazioni.maxPezzi} onClose={() => setShowPreventivo(false)} />
      )}
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
