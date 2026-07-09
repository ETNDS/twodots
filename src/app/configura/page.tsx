"use client";

import { useEffect, useState, Suspense, Fragment as ReactFragment } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getAnimaliPubblicati, Animale } from "@/lib/animali";
import {
  getCristalli, getCordini, getSmalti, getColoriResina, getFontDedica, getConfezioni,
  getImpostazioni, getPetCiondolo, getPetSizes, getFasceScontoPet, calcolaScontoPet,
  ItemColore, FontDedica, Confezione, Impostazioni, PetCiondolo, PetSize,
  PetConfigurato, FasciaScontoPet
} from "@/lib/configuratore";
import styles from "@styles/configura.module.css";
import { useCarrello } from "@/lib/carrello";
import Viewer3D from "@/components/Viewer3D";
import Dialog from "@/components/Dialog";

// ── TYPES ────────────────────────────────────────────────────────────────────

type Configurazione = {
  animale: Animale | null;
  coloreCiondolo: ItemColore | null;
  smalto: ItemColore | null;
  occhioSx: ItemColore | null;
  occhioDx: ItemColore | null;
  cordino: ItemColore | null;
  dedicaHum: string;
  fontDedicaHum: FontDedica | null;
  pets: PetConfigurato[];
  petInLavorazione: PetConfigurato | null;
  confezione: Confezione | null;
  quantitaHum: number;
};

const EMPTY_PET: Omit<PetConfigurato, "uid"> = {
  sizePet: null,
  etichettaSizePet: null,
  coloreCiondoloPet: null,
  occhioSxPet: null,
  occhioDxPet: null,
  dedicaPet: "",
  fontDedicaPet: null,
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
  pets: [],
  petInLavorazione: null,
  confezione: null,
  quantitaHum: 1,
};


const STEP_NOTE: Record<number, string> = {
  6: "Puoi incidere nomi, date o una breve frase. Il configuratore ti mostra in tempo reale quanti caratteri puoi ancora usare.",
  7: "Il PET è disponibile in tre misure per adattarsi alla taglia del tuo animale. Il prezzo viene aggiornato in tempo reale nel riepilogo a destra.",
};
const STEP_DESC: Record<number, string> = {
  0: "Scegli il soggetto che senti più tuo — è lui che darà carattere al tuo bijoux.",
  1: "Scegli la base: il colore della resina ceramica definisce il tono visivo di tutto il pezzo.",
  2: "Lo smalto colora il disegno dell'animale e crea il contrasto bicolore del bijoux.",
  3: "",  // testo dinamico nel JSX
  4: "Scegli il secondo punto luce — puoi tenerlo uguale o cambiarlo per un effetto unico.",
  5: "Il cordino è in materiale riciclato al 100%. Uno nero è fisso, scegli il secondo colore.",
  6: "Un nome, una data, una parola. Incisa a punta di diamante — o lascia il retro libero.",
  7: "Vuoi creare il set coordinato? Aggiungi un PET — stesso stile, stessi cristalli Swarovski. Puoi aggiungere una dedica sul retro.",
  9: "Scegli la confezione: sacchetto in cotone o scatola — entrambi già pronti per essere un regalo.",
  10: "Vuoi più copie? Aggiungile qui — oltre il limite massimo contattaci per un preventivo.",
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

function coloreGradient(css: string): string {
  return `radial-gradient(circle at 35% 35%, white 0%, ${css} 45%, color-mix(in srgb, ${css} 60%, black) 100%)`;
}

function newPetUid() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

// ── PREVIEW 3D PROGRESS ──────────────────────────────────────────────────────
// Componente riutilizzabile per HUM e PET.
// Mostra una barra sotto l'anteprima con "preview pronta in X/5".
// Sparisce quando show3D è true.

function Preview3DProgress({ completati, totale }: { completati: number; totale: number }) {
  const perc = Math.round((completati / totale) * 100);
  return (
    <div className={styles.preview3DProgress}>
      <div className={styles.preview3DProgressBar}>
        <div className={styles.preview3DProgressFill} style={{ width: `${perc}%` }} />
      </div>
      <span className={styles.preview3DProgressLabel}>
        preview pronta in {completati}/{totale}
      </span>
    </div>
  );
}

// ── COLORE CIRCLE ────────────────────────────────────────────────────────────

function ColoreCircle({ item, selezionato, onClick }: { item: ItemColore; selezionato: boolean; onClick: () => void }) {
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
              {immagini.map((url, i) => <img key={i} src={url} alt={`${item.nome} ${i + 1}`} className={styles.popupImg} />)}
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

// ── FONT PREVIEW POPUP ───────────────────────────────────────────────────────

function FontPreviewPopup({ testo, font, onClose }: { testo: string; font: FontDedica; onClose: () => void }) {
  const righe = testo.split("\n");
  const [fontPronto, setFontPronto] = useState(false);
  useEffect(() => {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.famiglia)}:wght@400;500;700&display=swap`;
    const id = `gfont-${font.famiglia.replace(/\s+/g, "-").toLowerCase()}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet"; link.href = url;
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
              {righe.map((r, i) => <div key={i}>{r || "\u00A0"}</div>)}
            </div>
          ) : (
            <div className={styles.fontPreviewTesto} style={{ opacity: 0.3, fontSize: "13px" }}>Caricamento font...</div>
          )}
        </div>
        <p className={styles.fontPreviewFamiglia}>{font.descrizione}</p>
        <p className={styles.fontPreviewSottotitolo}>{font.famiglia}</p>
        <p className={styles.fontPreviewHint}>L'incisione fisica sarà proporzionalmente più piccola.</p>
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
    if (!nome.trim() || !email.trim() || !messaggio.trim()) { setErrore("Compila tutti i campi obbligatori."); return; }
    setErrore(""); setInviando(true);
    try {
      const res = await fetch("/api/preventivo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, email, telefono, pezzi, messaggio }) });
      if (res.ok) setInviato(true);
      else setErrore("Errore nell'invio. Riprova.");
    } catch { setErrore("Errore nell'invio. Riprova."); }
    finally { setInviando(false); }
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
            <p className={styles.preventivoIntro}>Per ordini superiori a {maxPezzi} pezzi contattaci — ti prepariamo un preventivo su misura.</p>
            <div className={styles.preventivoForm}>
              <div className={styles.field}><label className={styles.fieldLabel}>Nome *</label><input className={styles.preventivoInput} type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Il tuo nome" /></div>
              <div className={styles.field}><label className={styles.fieldLabel}>Email *</label><input className={styles.preventivoInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="La tua email" /></div>
              <div className={styles.field}><label className={styles.fieldLabel}>Telefono</label><input className={styles.preventivoInput} type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Opzionale" /></div>
              <div className={styles.field}><label className={styles.fieldLabel}>Numero di pezzi indicativo</label><input className={styles.preventivoInput} type="number" min={maxPezzi + 1} value={pezzi} onChange={(e) => setPezzi(e.target.value)} placeholder={`Es. ${maxPezzi + 5}`} /></div>
              <div className={styles.field}><label className={styles.fieldLabel}>Descrivi la tua richiesta *</label><textarea className={styles.preventivoTextarea} rows={3} value={messaggio} onChange={(e) => setMessaggio(e.target.value)} placeholder="Raccontaci cosa ti serve..." /></div>
              {errore && <p className={styles.preventivoErrore}>{errore}</p>}
              <button className={styles.nextBtn} onClick={handleInvia} disabled={inviando}>{inviando ? "Invio in corso..." : "Invia richiesta"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── BANNER LIMITE rimosso ────────────────────────────────────────────────────────────

// ── PET WIZARD ───────────────────────────────────────────────────────────────

function PetWizard({
  pet, cristalli, coloriResina, fonts, sizes, petCiondolo, impostazioni, hasDedicaHum,
  onSalva, onAnnulla
}: {
  pet: PetConfigurato;
  cristalli: ItemColore[];
  coloriResina: ItemColore[];
  fonts: FontDedica[];
  sizes: PetSize[];
  petCiondolo: PetCiondolo | null;
  impostazioni: Impostazioni;
  hasDedicaHum: boolean;
  onSalva: (p: PetConfigurato) => void;
  onAnnulla: () => void;
}) {
  const [local, setLocal] = useState<PetConfigurato>({ ...pet });
  const [subStep, setSubStep] = useState(sizes.length > 0 ? -1 : 0);
  const [showPreview, setShowPreview] = useState(false);

  function upd(partial: Partial<PetConfigurato>) {
    setLocal(p => ({ ...p, ...partial }));
  }

  const fontPet = local.fontDedicaPet || fonts[0];
  const show3DPet = !!petCiondolo?.modello3D;
  const petCompleto = !!local.coloreCiondoloPet && !!local.occhioSxPet && !!local.occhioDxPet && (sizes.length === 0 || !!local.sizePet);

  // Progresso 3D per il PET: colore + occhio sx + occhio dx = 3 step fondamentali
  const pet3DTotale = sizes.length > 0 ? 4 : 3;
  const pet3DCompletati = [
    sizes.length > 0 ? local.sizePet : true,
    local.coloreCiondoloPet,
    local.occhioSxPet,
    local.occhioDxPet,
  ].filter(Boolean).length;

  const steps = [
    ...(sizes.length > 0 ? [{ id: -1, label: "Taglia", done: !!local.sizePet }] : []),
    { id: 0, label: "Colore", done: !!local.coloreCiondoloPet },
    { id: 1, label: "Occhio sx", done: !!local.occhioSxPet },
    { id: 2, label: "Occhio dx", done: !!local.occhioDxPet },
    { id: 3, label: "Dedica", done: true },
    { id: 99, label: "Riepilogo", done: false, mobileOnly: true },
  ];

  const prezzoDedicaPetEffettivo = hasDedicaHum
    ? (impostazioni.prezzoDedicaPet || 0)
    : (impostazioni.prezzoDedica || 0);

  return (
    <div className={styles.petWizardOverlay} onClick={onAnnulla}>
      <div className={styles.petWizard} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className={styles.petWizardHeader}>
          <h3 className={styles.petWizardTitolo}>Configura PET</h3>
          <button className={styles.popupClose} onClick={onAnnulla}>×</button>
        </div>

        {/* BODY: 3 colonne */}
        <div className={styles.petWizardBody}>

          {/* COL 1 — ANTEPRIMA + RIEPILOGO (navy) */}
          <div className={styles.petWizardCol1}>
            <div className={styles.anteprima}>
              {show3DPet ? (
                <Viewer3D
                  glbUrl={petCiondolo!.modello3D}
                  coloreCiondolo={local.coloreCiondoloPet?.coloreCSS ?? null}
                  coloreDisegno={null}
                  coloreOcchioSx={local.occhioSxPet?.coloreCSS ?? null}
                  coloreOcchioDx={local.occhioDxPet?.coloreCSS ?? null}
                />
              ) : petCiondolo?.immagineForma ? (
                <img src={petCiondolo.immagineForma} alt="PET" className={styles.anteprimaImg} />
              ) : (
                <div className={styles.anteprimaPlaceholder}><span>PET</span></div>
              )}
              <div className={styles.watermark3D}>
                {Array.from({ length: 6 }).map((_, i) => <span key={i}>2DOTS·2DOTS·2DOTS·2DOTS</span>)}
              </div>
              {show3DPet && <div className={styles.label3D}>↺ ruota</div>}
            </div>
            {!!petCiondolo && <p className={styles.viewerNota}>Anteprima indicativa, non definitiva.</p>}
            {pet3DCompletati < pet3DTotale && (
              <Preview3DProgress completati={pet3DCompletati} totale={pet3DTotale} />
            )}
            <div className={styles.riepilogoDettagli}>
              {local.sizePet && (
                <div className={styles.riepilogoRiga}>
                  <span className={styles.riepilogoLabel}>Taglia</span>
                  <span className={styles.riepilogoValore}>{local.etichettaSizePet || local.sizePet}</span>
                </div>
              )}
              {local.coloreCiondoloPet && (
                <div className={styles.riepilogoRiga}>
                  <span className={styles.riepilogoLabel}>Bijoux</span>
                  <span className={styles.riepilogoValore}>{local.coloreCiondoloPet?.nome}</span>
                </div>
              )}
              {local.occhioSxPet && (
                <div className={styles.riepilogoRiga}>
                  <span className={styles.riepilogoLabel}>Occhio sx</span>
                  <div className={styles.riepilogoColore}>
                    <div className={styles.riepilogoColoreDot} style={{ background: local.occhioSxPet.coloreCSS }} />
                    <span className={styles.riepilogoValore}>{local.occhioSxPet.nome}</span>
                  </div>
                </div>
              )}
              {local.occhioDxPet && (
                <div className={styles.riepilogoRiga}>
                  <span className={styles.riepilogoLabel}>Occhio dx</span>
                  <div className={styles.riepilogoColore}>
                    <div className={styles.riepilogoColoreDot} style={{ background: local.occhioDxPet.coloreCSS }} />
                    <span className={styles.riepilogoValore}>{local.occhioDxPet.nome}</span>
                  </div>
                </div>
              )}
              {local.dedicaPet && (
                <div className={styles.riepilogoRiga}>
                  <span className={styles.riepilogoLabel}>Dedica</span>
                  <span className={styles.riepilogoValore}>"{local.dedicaPet}"</span>
                </div>
              )}
              {local.dedicaPet && prezzoDedicaPetEffettivo > 0 && (
                <div className={styles.riepilogoRiga}>
                  <span className={styles.riepilogoLabel}>Supplemento</span>
                  <span className={styles.riepilogoValore}>€{prezzoDedicaPetEffettivo}</span>
                </div>
              )}
            </div>
          </div>

          {/* COL 2 — STEP LIST (tab fissi) */}
          <div className={styles.petWizardCol2}>
            {petCiondolo?.modello3D && (
              <div className={styles.viewerMini}>
                <Viewer3D
                  glbUrl={petCiondolo.modello3D}
                  coloreCiondolo={local.coloreCiondoloPet?.coloreCSS ?? null}
                  coloreDisegno={null}
                  coloreOcchioSx={local.occhioSxPet?.coloreCSS ?? null}
                  coloreOcchioDx={local.occhioDxPet?.coloreCSS ?? null}
                  height="120px"
                  zoom={3.5}
                />
              </div>
            )}
            {petCiondolo?.modello3D && (
              <p className={styles.viewerMiniNota}>Anteprima indicativa, non definitiva.</p>
            )}
            {steps.map((s) => (
              <button
                key={s.id}
                className={`${styles.petWizardTab} ${subStep === s.id ? styles.petWizardTabAttivo : ""} ${s.done ? styles.petWizardTabDone : ""} ${"mobileOnly" in s && s.mobileOnly ? styles.petWizardTabMobileOnly : ""}`}
                onClick={() => setSubStep(s.id)}
              >
                <span className={styles.petWizardTabDot}>{s.done ? "✓" : "○"}</span>
                <span className={styles.petWizardTabLabel}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* COL 3 — CONTENUTO STEP (scrolla) */}
          <div className={styles.petWizardCol3}>

            {/* TAGLIA */}
            {subStep === -1 && (
              <div className={styles.petWizardStepContent}>
                <p className={styles.stepDesc}>Scegli la taglia del ciondolo PET.</p>
                <div className={styles.sizeGrid}>
                  {sizes.map(s => (
                    <button key={s.id}
                      className={`${styles.sizeBtn} ${local.sizePet === s.slug ? styles.sizeBtnSel : ""}`}
                      onClick={() => { upd({ sizePet: s.slug, etichettaSizePet: s.etichetta }); setSubStep(0); }}>
                      {s.etichetta}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORE BIJOUX */}
            {subStep === 0 && (
              <div className={styles.petWizardStepContent}>
                <p className={styles.stepDesc}>Scegli il colore del bijoux PET.</p>
                <div className={styles.coloriGrid}>
                  {coloriResina.map((r) => <ColoreCircle key={r.id} item={r} selezionato={local.coloreCiondoloPet?.id === r.id} onClick={() => { upd({ coloreCiondoloPet: r }); setSubStep(1); }} />)}
                </div>
              </div>
            )}

            {/* OCCHIO SX */}
            {subStep === 1 && (
              <div className={styles.petWizardStepContent}>
                <p className={styles.stepDesc}>Scegli il cristallo Swarovski per l'occhio sinistro.</p>
                <div className={styles.coloriGrid}>
                  {cristalli.map((c) => (
                    <ColoreCircle key={c.id} item={c}
                      selezionato={local.occhioSxPet?.id === c.id}
                      onClick={() => { upd({ occhioSxPet: c }); setSubStep(2); }} />
                  ))}
                </div>
              </div>
            )}

            {/* OCCHIO DX */}
            {subStep === 2 && (
              <div className={styles.petWizardStepContent}>
                <p className={styles.stepDesc}>Scegli il cristallo Swarovski per l'occhio destro.</p>
                <div className={styles.coloriGrid}>
                  {cristalli.map((c) => (
                    <ColoreCircle key={c.id} item={c}
                      selezionato={local.occhioDxPet?.id === c.id}
                      onClick={() => { upd({ occhioDxPet: c }); setSubStep(3); }} />
                  ))}
                </div>
              </div>
            )}

            {/* DEDICA */}
            {subStep === 3 && (
              <div className={styles.petWizardStepContent}>
                <p className={styles.stepDesc}>Puoi incidere una dedica sul retro del bijoux PET.</p>
                {fonts.length > 0 && (
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Stile carattere</label>
                    <p className={styles.hintFont}>Dopo aver inserito il testo e selezionato il carattere si attiva il bottone "Anteprima testo" per visualizzare l'aspetto del testo con il font selezionato.</p>
                    <div className={styles.fontGridCompact}>
                      {fonts.map((f) => (
                        <button key={f.id}
                          className={`${styles.fontCardCompact} ${local.fontDedicaPet?.id === f.id || (!local.fontDedicaPet && fontPet?.id === f.id) ? styles.fontCardSel : ""}`}
                          onClick={() => upd({ fontDedicaPet: f })}>
                          <span className={styles.fontCardNomeCompact}>{f.descrizione}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {fontPet && (() => {
                  const font = fontPet;
                  const maxTotale = font.righe * font.caratteriPerRiga;
                  function handleDedica(val: string) {
                    const righe = val.split("\n");
                    const righeValide = righe.slice(0, font.righe).map(r => r.slice(0, font.caratteriPerRiga));
                    upd({ dedicaPet: righeValide.join("\n") });
                  }
                  return (
                    <>
                      <div className={styles.dedicaWrapper}>
                        <textarea className={styles.dedicaTextarea} rows={2}
                          value={local.dedicaPet} onChange={(e) => handleDedica(e.target.value)} />
                        {!local.dedicaPet && (
                          <span className={styles.dedicaPlaceholder}>Max {font.righe} righe × {font.caratteriPerRiga} caratteri</span>
                        )}
                      </div>
                      <div className={styles.dedicaHintRow}>
                        <p className={styles.hint}>{local.dedicaPet.replace(/\n/g, "").length}/{maxTotale} caratteri</p>
                        {local.dedicaPet.trim() && local.fontDedicaPet && (
                          <button className={styles.previewFontBtn} onClick={() => setShowPreview(true)}>Anteprima testo</button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* STEP 99 — RIEPILOGO PET (solo mobile, tab nascosto su desktop) */}
            {subStep === 99 && (
              <div className={styles.petWizardStepContent}>
                <div className={styles.riepilogoMobileStep}>
                  {local.sizePet && (
                    <div className={styles.riepilogoRiga}>
                      <span className={styles.riepilogoLabel}>Taglia</span>
                      <span className={styles.riepilogoValore}>{local.etichettaSizePet || local.sizePet}</span>
                    </div>
                  )}
                  {local.coloreCiondoloPet && (
                    <div className={styles.riepilogoRiga}>
                      <span className={styles.riepilogoLabel}>Bijoux</span>
                      <span className={styles.riepilogoValore}>{local.coloreCiondoloPet?.nome}</span>
                    </div>
                  )}
                  {local.occhioSxPet && (
                    <div className={styles.riepilogoRiga}>
                      <span className={styles.riepilogoLabel}>Occhio sx</span>
                      <div className={styles.riepilogoColore}>
                        <div className={styles.riepilogoColoreDot} style={{ background: local.occhioSxPet.coloreCSS }} />
                        <span className={styles.riepilogoValore}>{local.occhioSxPet.nome}</span>
                      </div>
                    </div>
                  )}
                  {local.occhioDxPet && (
                    <div className={styles.riepilogoRiga}>
                      <span className={styles.riepilogoLabel}>Occhio dx</span>
                      <div className={styles.riepilogoColore}>
                        <div className={styles.riepilogoColoreDot} style={{ background: local.occhioDxPet.coloreCSS }} />
                        <span className={styles.riepilogoValore}>{local.occhioDxPet.nome}</span>
                      </div>
                    </div>
                  )}
                  {local.dedicaPet && (
                    <div className={styles.riepilogoRiga}>
                      <span className={styles.riepilogoLabel}>Dedica</span>
                      <span className={styles.riepilogoValore}>"{local.dedicaPet}"</span>
                    </div>
                  )}
                  {local.dedicaPet && prezzoDedicaPetEffettivo > 0 && (
                    <div className={styles.riepilogoRiga}>
                      <span className={styles.riepilogoLabel}>Supplemento</span>
                      <span className={styles.riepilogoValore}>€{prezzoDedicaPetEffettivo}</span>
                    </div>
                  )}
                </div>
                <button
                  className={styles.nextBtn}
                  disabled={!petCompleto}
                  onClick={() => onSalva(local)}
                >
                  Salva PET
                </button>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.petWizardFooter}>
          <button className={styles.sceltaBtn} onClick={onAnnulla}>Annulla</button>
          <button className={styles.nextBtn} disabled={!petCompleto} onClick={() => onSalva(local)}>
            Salva PET
          </button>
        </div>
      </div>

      {showPreview && fontPet && local.dedicaPet.trim() && (
        <FontPreviewPopup testo={local.dedicaPet} font={fontPet} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}


// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

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
  const [coloriResina, setColoriResina] = useState<ItemColore[]>([]);
  const [fonts, setFonts] = useState<FontDedica[]>([]);
  const [confezioni, setConfezioni] = useState<Confezione[]>([]);
  const [impostazioni, setImpostazioni] = useState<Impostazioni>({ prezzoBase: 45, prezzoPet: 15, prezzoDedica: 0, prezzoDedicaPet: 0, maxPezzi: 5, maxPetPerHum: 3 });
  const [petCiondolo, setPetCiondolo] = useState<PetCiondolo | null>(null);
  const [petSizes, setPetSizes] = useState<PetSize[]>([]);
  const [fasceScontoPet, setFasceScontoPet] = useState<FasciaScontoPet[]>([]);
  const [aggiungendo, setAggiungendo] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPreviewHum, setShowPreviewHum] = useState(false);
  const [showPreventivo, setShowPreventivo] = useState(false);
  const [petWizardAperto, setPetWizardAperto] = useState(false);
  const [petInEditing, setPetInEditing] = useState<PetConfigurato | null>(null);

  useEffect(() => {
    if (resetParam === "1") { setConfig(EMPTY); setStepAttivo(0); router.replace("/configura"); }
  }, [resetParam]);

  useEffect(() => {
    async function carica() {
      const [a, cr, co, sm, re, fo, conf, imp, pet, sizes, fsp] = await Promise.all([
        getAnimaliPubblicati(), getCristalli(), getCordini(), getSmalti(), getColoriResina(), getFontDedica(),
        getConfezioni(), getImpostazioni(), getPetCiondolo(), getPetSizes(), getFasceScontoPet(),
      ]);
      setAnimali(a.sort((x, y) => x.nome.localeCompare(y.nome, "it")));
      setCristalli(cr.filter(x => x.attivo));
      setCordini(co.filter(x => x.attivo));
      setSmalti(sm.filter(x => x.attivo));
      setColoriResina(re.filter(x => x.attivo));
      setFonts(fo.filter(x => x.attivo));
      fo.filter(x => x.attivo).forEach(f => {
        const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.famiglia)}:wght@400;500;700&display=swap`;
        const id = `gfont-${f.famiglia.replace(/\s+/g, "-").toLowerCase()}`;
        if (!document.getElementById(id)) { const link = document.createElement("link"); link.id = id; link.rel = "stylesheet"; link.href = url; document.head.appendChild(link); }
      });
      setConfezioni(conf.filter(x => x.attivo));
      setImpostazioni(imp);
      setPetCiondolo(pet);
      setPetSizes(sizes.filter(s => s.attivo));
      setFasceScontoPet(fsp);
      if (animaleParam) {
        const trovato = a.find(x => x.id === animaleParam);
        if (trovato) setConfig(p => ({ ...p, animale: trovato }));
      }
      setLoading(false);
    }
    carica();
  }, [animaleParam]);

  // ── UPDATE con lock step fondamentali ──────────────────────────────────────
  // I 5 step fondamentali per il 3D (animale, coloreCiondolo, smalto, occhioSx, occhioDx)
  // possono essere cambiati ma non azzerati a null una volta impostati.
  function update(partial: Partial<Configurazione>) {
    setConfig(p => {
      const next = { ...p, ...partial };
      // Lock: se un campo fondamentale era già valorizzato, non può tornare a null
      const campiLockati: (keyof Configurazione)[] = ["animale", "coloreCiondolo", "smalto", "occhioSx", "occhioDx"];
      for (const campo of campiLockati) {
        if (p[campo] !== null && next[campo] === null) {
          (next as Record<string, unknown>)[campo] = p[campo];
        }
      }
      return next;
    });
  }

  // ── PREZZI ──────────────────────────────────────────────────────────────────
  const hasDedicaHum = config.dedicaHum.trim() !== "";
  const prezzoDedicaPetEffettivo = hasDedicaHum ? (impostazioni.prezzoDedicaPet || 0) : (impostazioni.prezzoDedica || 0);
  const prezzoHumBase = config.animale ? (config.animale.prezzo || impostazioni.prezzoBase) : 0;
  const prezzoConfezione = config.confezione?.prezzo || 0;
  const prezzoDedicaHumCalc = hasDedicaHum ? (impostazioni.prezzoDedica || 0) : 0;
  const prezzoPetUnitario = config.animale?.prezzoPet || impostazioni.prezzoPet;

  const nPet = config.pets.length;
  const fasciaAttivaPet = calcolaScontoPet(fasceScontoPet, nPet);
  const scontoPetPerc = fasciaAttivaPet?.percentuale || 0;
  const totalePetLordo = config.pets.reduce((acc, pet) => {
    const dedica = pet.dedicaPet.trim() ? prezzoDedicaPetEffettivo : 0;
    return acc + prezzoPetUnitario + dedica;
  }, 0);
  const scontoImportoPet = Math.round(totalePetLordo * scontoPetPerc) / 100;
  const totalePetNetto = totalePetLordo - scontoImportoPet;

  const prezzoHumSolo = prezzoHumBase + prezzoConfezione + prezzoDedicaHumCalc;
  const prezzoHumConPet = prezzoHumBase + prezzoConfezione + prezzoDedicaHumCalc + totalePetNetto;
  const totale = nPet > 0
    ? prezzoHumConPet * config.quantitaHum
    : prezzoHumSolo * config.quantitaHum;

  const pezziDisponibili = impostazioni.maxPezzi - totalePezzi;

  // ── WIZARD PET ──────────────────────────────────────────────────────────────
  function apriNuovoPet() {
    const nuovo: PetConfigurato = { uid: newPetUid(), ...EMPTY_PET };
    setPetInEditing(nuovo);
    setPetWizardAperto(true);
  }

  function apriModificaPet(pet: PetConfigurato) {
    setPetInEditing({ ...pet });
    setPetWizardAperto(true);
  }

  function salvaPet(petSalvato: PetConfigurato) {
    setConfig(p => {
      const esistente = p.pets.find(x => x.uid === petSalvato.uid);
      if (esistente) {
        return { ...p, pets: p.pets.map(x => x.uid === petSalvato.uid ? petSalvato : x) };
      } else {
        return { ...p, pets: [...p.pets, petSalvato] };
      }
    });
    setPetWizardAperto(false);
    setPetInEditing(null);
  }

  function rimuoviPet(uid: string) {
    setConfig(p => ({ ...p, pets: p.pets.filter(x => x.uid !== uid) }));
  }

  // ── STEP COMPLETATI ─────────────────────────────────────────────────────────
  const [maxStepRaggiunto, setMaxStepRaggiunto] = useState(0);

  const stepCompletati: Record<number, boolean> = {
    0: !!config.animale,
    1: !!config.coloreCiondolo,
    2: !!config.smalto,
    3: !!config.occhioSx,
    4: !!config.occhioDx,
    5: !!config.cordino,
    6: maxStepRaggiunto >= 6,
    7: maxStepRaggiunto >= 7,
    9: !!config.confezione,
    10: maxStepRaggiunto >= 10,
    11: false,
  };

  function goToStep(n: number) {
    setMaxStepRaggiunto(prev => Math.max(prev, stepAttivo));
    setStepAttivo(n);
  }

  const tuttiCompletati =
    !!config.animale && !!config.coloreCiondolo && !!config.smalto &&
    !!config.occhioSx && !!config.occhioDx && !!config.cordino && !!config.confezione;

  async function handleAggiungiAlCarrello() {
    if (!tuttiCompletati) return;
    setAggiungendo(true);
    try {
      aggiungi({
        id: Date.now().toString(),
        animale: config.animale!,
        coloreCiondolo: config.coloreCiondolo!.coloreCSS,
        smalto: config.smalto!,
        occhioSx: config.occhioSx!,
        occhioDx: config.occhioDx!,
        cordino: config.cordino!,
        dedicaHum: config.dedicaHum,
        fontDedicaHum: config.fontDedicaHum,
        pet: config.pets,
        confezione: config.confezione!,
        quantitaHum: config.quantitaHum,
        prezzoHumSolo,
        prezzoHumConPet,
        scontoPetPercentuale: scontoPetPerc,
        codiceScontoPet: fasciaAttivaPet?.codiceShopify || null,
      });
      setStepAttivo(0);
      setConfig(EMPTY);
      setMaxStepRaggiunto(0);
      router.push("/carrello");
    } catch (e) {
      console.error(e);
      alert("Errore. Riprova.");
    } finally {
      setAggiungendo(false);
    }
  }

  const fontHum = config.fontDedicaHum || fonts[0];
  const show3DViewer = !!config.animale?.modello3D;

  // Progresso 3D per il bijoux HUM: animale + colore + smalto + occhio sx + occhio dx = 5 step
  const hum3DCompletati = [config.animale, config.coloreCiondolo, config.smalto, config.occhioSx, config.occhioDx].filter(Boolean).length;

  if (loading) return (
    <><BackgroundLogo /><Navbar /><main className={styles.main}><p className={styles.loading}>Caricamento...</p></main><Footer /></>
  );

  if (pezziDisponibili <= 0) return (
    <><BackgroundLogo /><Navbar />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.introLabel}>CONFIGURA</p>
          <h1 className={styles.introTitolo}>Crea il tuo bijoux</h1>
        </div>
        <div className={styles.limitePagina}>
          <div className={styles.limitePaginaIcona}>⚑</div>
          <p className={styles.limitePaginaTitolo}>Hai raggiunto il massimo di {impostazioni.maxPezzi} pezzi per ordine online.</p>
          <p className={styles.limitePaginaSub}>Per ordini più grandi ti prepariamo un preventivo su misura.</p>
          <div className={styles.limitePaginaBtns}>
            <button className={styles.ctaBtnPrimary} onClick={() => setShowPreventivo(true)}>Richiedi preventivo</button>
            <button className={styles.linkBtn} onClick={() => router.push("/carrello")}>Vai al carrello</button>
          </div>
        </div>
      </main>
      <Footer />
      {showPreventivo && <ModuloPreventivo maxPezzi={impostazioni.maxPezzi} onClose={() => setShowPreventivo(false)} />}
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
          <div className={styles.introRow}>
            <p className={styles.introSub}>In pochi passaggi costruisci il bijoux che non esiste ancora.</p>
            <button className={styles.resetBtn} onClick={() => setShowResetDialog(true)}>Ricomincia</button>
          </div>
        </div>



        <div className={styles.layout3col}>

          {/* COL SINISTRA — viewer mini + step list */}
          <div className={styles.col2}>
            {config.animale?.modello3D && (
              <div className={styles.viewerMini}>
                <Viewer3D
                  glbUrl={config.animale.modello3D}
                  coloreCiondolo={config.coloreCiondolo?.coloreCSS ?? null}
                  coloreDisegno={config.smalto?.coloreCSS ?? null}
                  coloreOcchioSx={config.occhioSx?.coloreCSS ?? null}
                  coloreOcchioDx={config.occhioDx?.coloreCSS ?? null}
                  height="120px"
                  zoom={3.5}
                />
                <div className={styles.viewerMiniLabel}>↺</div>
              </div>
            )}
            {config.animale?.modello3D && (
              <p className={styles.viewerMiniNota}>Anteprima indicativa, non definitiva.</p>
            )}
            <div className={styles.stepList}>
              {[
                { id: 0, num: "01", label: "Animale", done: !!config.animale },
                { id: 1, num: "02", label: "Colore", done: !!config.coloreCiondolo },
                { id: 2, num: "03", label: "Disegno", done: !!config.smalto },
                { id: 3, num: "04", label: "Occhio sx", done: !!config.occhioSx },
                { id: 4, num: "05", label: "Occhio dx", done: !!config.occhioDx },
                { id: 5, num: "06", label: "Cordino", done: !!config.cordino },
                { id: 6, num: "07", label: "Dedica", done: maxStepRaggiunto >= 6 },
                ...(petSizes.length > 0 ? [{ id: 7, num: "08", label: "PET", done: maxStepRaggiunto >= 7 }] : []),
                { id: 9, num: petSizes.length > 0 ? "09" : "08", label: "Confezione", done: !!config.confezione },
                { id: 10, num: petSizes.length > 0 ? "10" : "09", label: "Quantità", done: maxStepRaggiunto >= 10 },
                { id: 11, num: petSizes.length > 0 ? "11" : "10", label: "Conferma", done: false },
              ].map((s) => (
                <button key={s.id}
                  title={s.label}
                  className={`${styles.stepListItem} ${stepAttivo === s.id ? styles.stepListItemAttivo : ""} ${s.done && stepAttivo !== s.id ? styles.stepListItemDone : ""}`}
                  onClick={() => setStepAttivo(s.id)}>
                  <span className={styles.stepListDot}>{s.done && stepAttivo !== s.id ? "✓" : "○"}</span>
                  <span className={styles.stepListLabel}>{s.label}</span>
                  <span className={styles.stepListNum}>{s.num}</span>
                </button>
              ))}
            </div>
          </div>

          {/* COL CENTRALE — contenuto step attivo */}
          <div className={styles.col3}>
            <div className={styles.col3Inner}>

              {/* STEP 0 — ANIMALE */}
              {stepAttivo === 0 && (
                <div className={styles.stepContent} id="step-0">
                  <p className={styles.stepDesc}>{STEP_DESC[0]}</p>
                  {(() => {
                    const inEvidenza = animali.filter(a => a.inEvidenza).sort((x, y) => x.nome.localeCompare(y.nome, "it"));
                    const altri = animali.filter(a => !a.inEvidenza).sort((x, y) => x.nome.localeCompare(y.nome, "it"));
                    return (
                      <>
                        {inEvidenza.length > 0 && (
                          <>
                            <p className={styles.animaliLabel}>I più scelti</p>
                            <div className={styles.animaliGrid}>
                              {inEvidenza.map(a => (
                                <AnimaleCard key={a.id} a={a} selezionato={config.animale?.id === a.id} onClick={() => { update({ animale: a }); setStepAttivo(1); }} />
                              ))}
                            </div>
                            <div className={styles.animaliSeparatore} />
                          </>
                        )}
                        <div className={styles.animaliGrid}>
                          {altri.map(a => (
                            <AnimaleCard key={a.id} a={a} selezionato={config.animale?.id === a.id} onClick={() => { update({ animale: a }); setStepAttivo(1); }} />
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* STEP 1 — COLORE BIJOUX */}
              {stepAttivo === 1 && (
                <div className={styles.stepContent} id="step-1">
                  <p className={styles.stepDesc}>{STEP_DESC[1]}</p>
                  <div className={styles.coloriGrid}>
                    {coloriResina.map((r) => <ColoreCircle key={r.id} item={r} selezionato={config.coloreCiondolo?.id === r.id} onClick={() => { update({ coloreCiondolo: r }); setStepAttivo(2); }} />)}
                  </div>
                </div>
              )}

              {/* STEP 2 — SMALTO */}
              {stepAttivo === 2 && (
                <div className={styles.stepContent} id="step-2">
                  <p className={styles.stepDesc}>{STEP_DESC[2]}</p>
                  <div className={styles.coloriGrid}>
                    {smalti.map((s) => <ColoreCircle key={s.id} item={s} selezionato={config.smalto?.id === s.id} onClick={() => { update({ smalto: s }); setStepAttivo(3); }} />)}
                  </div>
                </div>
              )}

              {/* STEP 3 — OCCHIO SX */}
              {stepAttivo === 3 && (
                <div className={styles.stepContent} id="step-3">
                  <p className={styles.stepDesc}>Scegli il primo punto luce — {cristalli.length} colori Swarovski originali, anche diversi tra loro.</p>
                  <div className={styles.coloriGrid}>
                    {cristalli.map((c) => <ColoreCircle key={c.id} item={c} selezionato={config.occhioSx?.id === c.id} onClick={() => { update({ occhioSx: c }); setStepAttivo(4); }} />)}
                  </div>
                </div>
              )}

              {/* STEP 4 — OCCHIO DX */}
              {stepAttivo === 4 && (
                <div className={styles.stepContent} id="step-4">
                  <p className={styles.stepDesc}>{STEP_DESC[4]}</p>
                  <div className={styles.coloriGrid}>
                    {cristalli.map((c) => <ColoreCircle key={c.id} item={c} selezionato={config.occhioDx?.id === c.id} onClick={() => { update({ occhioDx: c }); setStepAttivo(5); }} />)}
                  </div>
                </div>
              )}

              {/* STEP 5 — CORDINO */}
              {stepAttivo === 5 && (
                <div className={styles.stepContent} id="step-5">
                  <p className={styles.stepDesc}>{STEP_DESC[5]}</p>
                  <div className={styles.coloriGrid}>
                    {cordini.map((c) => <ColoreCircle key={c.id} item={c} selezionato={config.cordino?.id === c.id} onClick={() => { update({ cordino: c }); setStepAttivo(6); }} />)}
                  </div>
                </div>
              )}

              {/* STEP 6 — DEDICA HUM */}
              {stepAttivo === 6 && (
                <div className={styles.stepContent} id="step-6">
                  <p className={styles.stepDesc}>{STEP_DESC[6]}</p>
                  <p className={styles.stepNote}>{STEP_NOTE[6]}</p>
                  <div className={styles.field}>
                    <p className={styles.hintFont}>Dopo aver inserito il testo e selezionato il carattere si attiva il bottone "Anteprima testo" per visualizzare l'aspetto del testo con il font selezionato.</p>
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
                            <textarea className={styles.dedicaTextarea} rows={2}
                              value={config.dedicaHum} onChange={(e) => handleDedica(e.target.value)} />
                            {!config.dedicaHum && (
                              <span className={styles.dedicaPlaceholder}>Max {font.righe} righe × {font.caratteriPerRiga} caratteri</span>
                            )}
                          </div>
                          <div className={styles.dedicaHintRow}>
                            <p className={styles.hint}>
                              {config.dedicaHum.replace(/\n/g, "").length}/{maxTotale} caratteri
                              {impostazioni.prezzoDedica > 0 && ` — supplemento €${impostazioni.prezzoDedica}`}
                            </p>
                            {config.dedicaHum.trim() && config.fontDedicaHum && (
                              <button className={styles.previewFontBtn} onClick={() => setShowPreviewHum(true)}>Anteprima testo</button>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {fonts.length > 0 && (
                    <div>
                      <p className={styles.fontGridLabel}>Stile del carattere</p>
                      <div className={styles.fontGrid}>
                        {fonts.map((f) => (
                          <button key={f.id} className={`${styles.fontCard} ${config.fontDedicaHum?.id === f.id ? styles.fontCardSel : ""}`}
                            onClick={() => update({ fontDedicaHum: f })}>
                            <span className={styles.fontCardNome}>{f.descrizione}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button className={styles.nextBtn} onClick={() => goToStep(petSizes.length > 0 ? 7 : 9)}>Continua →</button>
                </div>
              )}

              {/* STEP 7 — PET (solo se petSizes configurate) */}
              {petSizes.length > 0 && stepAttivo === 7 && (
                <div className={styles.stepContent} id="step-7">
                  <p className={styles.stepDesc}>{STEP_DESC[7]}</p>
                  <p className={styles.stepNote}>{STEP_NOTE[7]}</p>

                  {config.pets.map((pet, i) => (
                    <div key={pet.uid} className={styles.petCard}>
                      <div className={styles.petCardInfo}>
                        <span className={styles.petCardNum}>PET {i + 1}</span>
                        <span className={styles.petCardDet}>
                          {pet.etichettaSizePet && `${pet.etichettaSizePet} · `}
                          {pet.coloreCiondoloPet?.nome}
                          {pet.occhioSxPet && ` · ${pet.occhioSxPet.nome}`}
                          {pet.dedicaPet && ` · "${pet.dedicaPet}"`}
                        </span>
                      </div>
                      <div className={styles.petCardAzioni}>
                        <button className={styles.petCardEdit} onClick={() => apriModificaPet(pet)}>Modifica</button>
                        <button className={styles.petCardRemove} onClick={() => rimuoviPet(pet.uid)}>×</button>
                      </div>
                    </div>
                  ))}

                  {scontoPetPerc > 0 && (
                    <p className={styles.hint} style={{ color: "green" }}>
                      Sconto PET {scontoPetPerc}% applicato su {nPet} PET
                    </p>
                  )}

                  {nPet < impostazioni.maxPetPerHum && (
                    <button className={styles.petCardAdd} onClick={apriNuovoPet}>
                      + Aggiungi {nPet === 0 ? "un bijoux PET" : "un altro PET"}
                    </button>
                  )}
                  {nPet >= impostazioni.maxPetPerHum && (
                    <p className={styles.hint}>Massimo {impostazioni.maxPetPerHum} PET per bijoux YOU.</p>
                  )}

                  <button className={styles.nextBtn} style={{ marginTop: 16 }} onClick={() => goToStep(9)}>Continua →</button>
                </div>
              )}

              {/* STEP 9 — CONFEZIONE */}
              {stepAttivo === 9 && (
                <div className={styles.stepContent} id="step-9">
                  <p className={styles.stepDesc}>{STEP_DESC[9]}</p>
                  <div className={styles.confezioniGrid}>
                    {confezioni.map((c) => (
                      <button key={c.id} className={`${styles.confezioneCard} ${config.confezione?.id === c.id ? styles.confezioneCardSel : ""}`}
                        onClick={() => { update({ confezione: c }); setTimeout(() => setStepAttivo(10), 100); }}>
                        {c.immagini?.[0] && <div className={styles.confezioneImg}><img src={c.immagini[0]} alt={c.nome} /></div>}
                        <p className={styles.confezioneNome}>{c.nome}</p>
                        <p className={styles.confezioneDesc}>{c.descrizione}</p>
                        {c.prezzo > 0 && <p className={styles.confezionePrezzo}>+€{c.prezzo}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 10 — QUANTITÀ */}
              {stepAttivo === 10 && (
                <div className={styles.stepContent} id="step-10">
                  <p className={styles.stepNote}>Puoi aggiungere fino a {impostazioni.maxPezzi} pezzi in un unico ordine. Se ti serve una quantità maggiore, <button className={styles.stepNoteLink} onClick={() => setShowPreventivo(true)}>chiedi un preventivo</button>.</p>
                  <p className={styles.stepDesc}>
                    {config.pets.length === 0
                      ? "Quante copie di questo bijoux vuoi aggiungere al carrello?"
                      : config.pets.length === 1
                      ? "Quante copie di questo bijoux e del suo PET vuoi aggiungere al carrello?"
                      : `Quante copie di questo bijoux e dei suoi ${config.pets.length} PET vuoi aggiungere al carrello?`}
                  </p>
                  <div className={config.pets.length > 0 ? styles.quantitaGrid : ""}>
                    <div>
                      <p className={styles.quantitaLabel}>
                        {config.pets.length > 0
                          ? `set (bijoux + ${config.pets.length} PET)`
                          : "bijoux"}
                      </p>
                      <div className={styles.quantitaRow}>
                        <button className={styles.quantitaBtn} disabled={config.quantitaHum <= 1}
                          onClick={() => update({ quantitaHum: Math.max(1, config.quantitaHum - 1) })}>−</button>
                        <span className={styles.quantitaValore}>{config.quantitaHum}</span>
                        <button className={styles.quantitaBtn} disabled={config.quantitaHum >= pezziDisponibili}
                          onClick={() => update({ quantitaHum: Math.min(pezziDisponibili, config.quantitaHum + 1) })}>+</button>
                      </div>
                    </div>
                  </div>

                  <button className={styles.nextBtn} onClick={() => goToStep(11)}>Conferma →</button>
                </div>
              )}


              {/* STEP 11 — CONFERMA FINALE */}
              {stepAttivo === 11 && (
                <div className={styles.stepContent} id="step-11">

                  {/* RIEPILOGO MOBILE — visibile solo su mobile (su desktop c'è col1) */}
                  <div className={styles.riepilogoMobileStep}>
                    <div className={styles.anteprimaWrapper}>
                      <div className={styles.anteprima}>
                        {show3DViewer ? (
                          <Viewer3D
                            glbUrl={config.animale!.modello3D!}
                            coloreCiondolo={config.coloreCiondolo?.coloreCSS ?? null}
                            coloreDisegno={config.smalto?.coloreCSS ?? null}
                            coloreOcchioSx={config.occhioSx?.coloreCSS ?? null}
                            coloreOcchioDx={config.occhioDx?.coloreCSS ?? null}
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
                            {Array.from({ length: 6 }).map((_, i) => <span key={i}>2DOTS·2DOTS·2DOTS·2DOTS</span>)}
                          </div>
                        )}
                        {show3DViewer && <div className={styles.label3D}>↺ ruota</div>}
                      </div>
                      {!!config.animale && <p className={styles.viewerNota}>Anteprima indicativa, non definitiva.</p>}
                      {!show3DViewer && (
                        <Preview3DProgress completati={hum3DCompletati} totale={5} />
                      )}
                    </div>
                    <div className={styles.prezzoBox}>
                      <div className={styles.prezzoRiga}><span>YOU</span><span>€{prezzoHumBase}</span></div>
                      {hasDedicaHum && impostazioni.prezzoDedica > 0 && <div className={styles.prezzoRiga}><span>Dedica YOU</span><span>€{impostazioni.prezzoDedica}</span></div>}
                      {config.pets.map((pet, i) => (
                        <div key={pet.uid} className={styles.prezzoRiga}>
                          <span>PET {i + 1}{pet.dedicaPet.trim() ? " + dedica" : ""}</span>
                          <span>€{prezzoPetUnitario + (pet.dedicaPet.trim() ? prezzoDedicaPetEffettivo : 0)}</span>
                        </div>
                      ))}
                      {scontoPetPerc > 0 && <div className={styles.prezzoRiga} style={{ color: "green" }}><span>Sconto PET {scontoPetPerc}%</span><span>−€{scontoImportoPet}</span></div>}
                      {prezzoConfezione > 0 && <div className={styles.prezzoRiga}><span>Confezione</span><span>€{prezzoConfezione}</span></div>}
                      {config.quantitaHum > 1 && <div className={styles.prezzoRiga}><span>× {config.quantitaHum} pezzi</span><span></span></div>}
                      <div className={styles.prezzoTotale}><span>Totale</span><span>€{totale}</span></div>
                    </div>
                    <div className={styles.riepilogoDettagli}>
                      {config.animale && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Animale</span><span className={styles.riepilogoValore}>{config.animale.nome}</span></div>}
                      {config.coloreCiondolo && (
                        <div className={styles.riepilogoRiga}>
                          <span className={styles.riepilogoLabel}>Bijoux</span>
                          <div className={styles.riepilogoColore}>
                            <div className={styles.riepilogoColoreDot} style={{ background: config.coloreCiondolo?.coloreCSS }} />
                            <span className={styles.riepilogoValore}>{config.coloreCiondolo?.nome}</span>
                          </div>
                        </div>
                      )}
                      {config.smalto && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Disegno</span><div className={styles.riepilogoColore}><RiepilogoColore item={config.smalto} /><span className={styles.riepilogoValore}>{config.smalto.nome}</span></div></div>}
                      {config.occhioSx && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Swarovski sx</span><div className={styles.riepilogoColore}><RiepilogoColore item={config.occhioSx} /><span className={styles.riepilogoValore}>{config.occhioSx.nome}</span></div></div>}
                      {config.occhioDx && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Swarovski dx</span><div className={styles.riepilogoColore}><RiepilogoColore item={config.occhioDx} /><span className={styles.riepilogoValore}>{config.occhioDx.nome}</span></div></div>}
                      {config.cordino && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Cordino</span><div className={styles.riepilogoColore}><RiepilogoColore item={config.cordino} /><span className={styles.riepilogoValore}>{config.cordino.nome}</span></div></div>}
                      {config.dedicaHum && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Dedica</span><span className={styles.riepilogoValore}>"{config.dedicaHum}"</span></div>}
                      {config.pets.length > 0 && (
                        <div className={styles.riepilogoPetGroup}>
                          <span className={styles.riepilogoPetGroupLabel}>↳ bijoux PET</span>
                          {config.pets.map((pet, i) => (
                            <div key={pet.uid} className={styles.riepilogoPetItem}>
                              <div className={styles.riepilogoRiga}>
                                <span className={styles.riepilogoLabel}>PET {i + 1}</span>
                                <span className={styles.riepilogoValore}>
                                  {pet.etichettaSizePet && `${pet.etichettaSizePet} · `}
                                  {pet.coloreCiondoloPet?.nome}
                                </span>
                              </div>
                              {pet.occhioSxPet && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>sx</span><div className={styles.riepilogoColore}><RiepilogoColore item={pet.occhioSxPet} /><span className={styles.riepilogoValore}>{pet.occhioSxPet.nome}</span></div></div>}
                              {pet.occhioDxPet && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>dx</span><div className={styles.riepilogoColore}><RiepilogoColore item={pet.occhioDxPet} /><span className={styles.riepilogoValore}>{pet.occhioDxPet.nome}</span></div></div>}
                              {pet.dedicaPet && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>dedica</span><span className={styles.riepilogoValore}>"{pet.dedicaPet}"</span></div>}
                            </div>
                          ))}
                        </div>
                      )}
                      {config.confezione && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Confezione</span><span className={styles.riepilogoValore}>{config.confezione.nome}</span></div>}
                    </div>
                  </div>
                  {/* FINE RIEPILOGO MOBILE */}

                  <p className={styles.stepDesc}>
                    {tuttiCompletati
                      ? "Hai terminato la configurazione. Il tuo bijoux è pronto per essere realizzato."
                      : "Completa tutti gli step prima di procedere."}
                  </p>
                  {tuttiCompletati && (
                    <div className={styles.stepWarning} style={{ borderLeft: "2px solid var(--color-navy)", background: "rgba(13,14,46,0.04)" }}>
                      <p className={styles.stepWarningTesto}>⚠ Attenzione</p>
                      <p className={styles.stepWarningItem}>Una volta aggiunto al carrello, la configurazione non può essere modificata. Per cambiarla occorrerà rimuovere l'elemento dal carrello e procedere a una nuova configurazione.</p>
                    </div>
                  )}

                  {!tuttiCompletati && (
                    <div className={styles.stepWarning}>
                      <p className={styles.stepWarningTesto}>Step mancanti:</p>
                      {!config.animale && <p className={styles.stepWarningItem}>→ Animale</p>}
                      {!config.coloreCiondolo && <p className={styles.stepWarningItem}>→ Colore bijoux</p>}
                      {!config.smalto && <p className={styles.stepWarningItem}>→ Colore disegno</p>}
                      {!config.occhioSx && <p className={styles.stepWarningItem}>→ Occhio sinistro</p>}
                      {!config.occhioDx && <p className={styles.stepWarningItem}>→ Occhio destro</p>}
                      {!config.cordino && <p className={styles.stepWarningItem}>→ Cordino</p>}
                      {!config.confezione && <p className={styles.stepWarningItem}>→ Confezione</p>}
                    </div>
                  )}

                  <button
                    className={styles.ctaBtnPrimary}
                    disabled={!tuttiCompletati || aggiungendo}
                    onClick={handleAggiungiAlCarrello}
                  >
                    {aggiungendo ? "Preparazione..." : "Aggiungi al carrello"}
                  </button>

                  <button className={styles.sceltaBtn} onClick={() => setShowResetDialog(true)}>
                    Ricomincia da capo
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* COL DESTRA — riepilogo navy */}
          <div className={styles.riepilogo}>
            <div className={styles.riepilogoInner}>

              <div className={styles.riepilogoScroll}>

              {/* ANTEPRIMA YOU */}
              <div className={styles.anteprimaWrapper}>
                <div className={styles.anteprima}>
                  {show3DViewer ? (
                    <Viewer3D
                      glbUrl={config.animale!.modello3D!}
                      coloreCiondolo={config.coloreCiondolo?.coloreCSS ?? null}
                      coloreDisegno={config.smalto?.coloreCSS ?? null}
                      coloreOcchioSx={config.occhioSx?.coloreCSS ?? null}
                      coloreOcchioDx={config.occhioDx?.coloreCSS ?? null}
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
                      {Array.from({ length: 6 }).map((_, i) => <span key={i}>2DOTS·2DOTS·2DOTS·2DOTS</span>)}
                    </div>
                  )}
                  {show3DViewer && <div className={styles.label3D}>↺ ruota</div>}
                </div>
                {!!config.animale && <p className={styles.viewerNota}>Anteprima indicativa, non definitiva.</p>}
                {!show3DViewer && (
                  <Preview3DProgress completati={hum3DCompletati} totale={5} />
                )}
              </div>


              {/* PREZZI */}
              <div className={styles.prezzoBox}>
                <div className={styles.prezzoRiga}><span>YOU</span><span>€{prezzoHumBase}</span></div>
                {hasDedicaHum && impostazioni.prezzoDedica > 0 && <div className={styles.prezzoRiga}><span>Dedica YOU</span><span>€{impostazioni.prezzoDedica}</span></div>}
                {config.pets.map((pet, i) => (
                  <div key={pet.uid} className={styles.prezzoRiga}>
                    <span>PET {i + 1}{pet.dedicaPet.trim() ? " + dedica" : ""}</span>
                    <span>€{prezzoPetUnitario + (pet.dedicaPet.trim() ? prezzoDedicaPetEffettivo : 0)}</span>
                  </div>
                ))}
                {scontoPetPerc > 0 && <div className={styles.prezzoRiga} style={{ color: "green" }}><span>Sconto PET {scontoPetPerc}%</span><span>−€{scontoImportoPet}</span></div>}
                {prezzoConfezione > 0 && <div className={styles.prezzoRiga}><span>Confezione</span><span>€{prezzoConfezione}</span></div>}
                {config.quantitaHum > 1 && <div className={styles.prezzoRiga}><span>× {config.quantitaHum} pezzi</span><span></span></div>}
                <div className={styles.prezzoTotale}><span>Totale</span><span>€{totale}</span></div>
              </div>

              {/* DETTAGLI YOU */}
              <div className={styles.riepilogoDettagli}>
                {config.animale && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Animale</span><span className={styles.riepilogoValore}>{config.animale.nome}</span></div>}
                {config.coloreCiondolo && (
                  <div className={styles.riepilogoRiga}>
                    <span className={styles.riepilogoLabel}>Bijoux</span>
                    <div className={styles.riepilogoColore}>
                      <div className={styles.riepilogoColoreDot} style={{ background: config.coloreCiondolo?.coloreCSS }} />
                      <span className={styles.riepilogoValore}>{config.coloreCiondolo?.nome}</span>
                    </div>
                  </div>
                )}
                {config.smalto && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Disegno</span><div className={styles.riepilogoColore}><RiepilogoColore item={config.smalto} /><span className={styles.riepilogoValore}>{config.smalto.nome}</span></div></div>}
                {config.occhioSx && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Swarovski sx</span><div className={styles.riepilogoColore}><RiepilogoColore item={config.occhioSx} /><span className={styles.riepilogoValore}>{config.occhioSx.nome}</span></div></div>}
                {config.occhioDx && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Swarovski dx</span><div className={styles.riepilogoColore}><RiepilogoColore item={config.occhioDx} /><span className={styles.riepilogoValore}>{config.occhioDx.nome}</span></div></div>}
                {config.cordino && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Cordino</span><div className={styles.riepilogoColore}><RiepilogoColore item={config.cordino} /><span className={styles.riepilogoValore}>{config.cordino.nome}</span></div></div>}
                {config.dedicaHum && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Dedica</span><span className={styles.riepilogoValore}>"{config.dedicaHum}"</span></div>}

                {config.pets.length > 0 && (
                  <div className={styles.riepilogoPetGroup}>
                    <span className={styles.riepilogoPetGroupLabel}>↳ bijoux PET</span>
                    {config.pets.map((pet, i) => (
                      <div key={pet.uid} className={styles.riepilogoPetItem}>
                        <div className={styles.riepilogoRiga}>
                          <span className={styles.riepilogoLabel}>PET {i + 1}</span>
                          <span className={styles.riepilogoValore}>
                            {pet.etichettaSizePet && `${pet.etichettaSizePet} · `}
                            {pet.coloreCiondoloPet?.nome}
                          </span>
                        </div>
                        {pet.occhioSxPet && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>sx</span><div className={styles.riepilogoColore}><RiepilogoColore item={pet.occhioSxPet} /><span className={styles.riepilogoValore}>{pet.occhioSxPet.nome}</span></div></div>}
                        {pet.occhioDxPet && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>dx</span><div className={styles.riepilogoColore}><RiepilogoColore item={pet.occhioDxPet} /><span className={styles.riepilogoValore}>{pet.occhioDxPet.nome}</span></div></div>}
                        {pet.dedicaPet && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>dedica</span><span className={styles.riepilogoValore}>"{pet.dedicaPet}"</span></div>}
                      </div>
                    ))}
                  </div>
                )}

                {config.confezione && <div className={styles.riepilogoRiga}><span className={styles.riepilogoLabel}>Confezione</span><span className={styles.riepilogoValore}>{config.confezione.nome}</span></div>}
              </div>

              </div>{/* /riepilogoScroll */}

            </div>{/* /riepilogoInner */}
          </div>{/* /riepilogo */}

        </div>
      </main>
      <Footer />

            {showResetDialog && (
        <Dialog titolo="Ricominciare?" testo="Perderai tutte le scelte fatte finora." confermaTesto="Sì, ricomincia" annullaTesto="Annulla"
          onConferma={() => { setShowResetDialog(false); setConfig(EMPTY); setStepAttivo(0); setMaxStepRaggiunto(0); }}
          onAnnulla={() => setShowResetDialog(false)} />
      )}

      {showPreviewHum && fontHum && config.dedicaHum.trim() && (
        <FontPreviewPopup testo={config.dedicaHum} font={fontHum} onClose={() => setShowPreviewHum(false)} />
      )}

      {showPreventivo && (
        <ModuloPreventivo maxPezzi={impostazioni.maxPezzi} onClose={() => setShowPreventivo(false)} />
      )}

      {petWizardAperto && petInEditing && (
        <PetWizard
          pet={petInEditing}
          cristalli={cristalli}
          fonts={fonts}
          sizes={petSizes}
          petCiondolo={petCiondolo}
          impostazioni={impostazioni}
          hasDedicaHum={hasDedicaHum}
          coloriResina={coloriResina}
          onSalva={salvaPet}
          onAnnulla={() => { setPetWizardAperto(false); setPetInEditing(null); }}
        />
      )}
    </>
  );
}

const AnimaleCard = ({ a, selezionato, onClick }: { a: Animale; selezionato: boolean; onClick: () => void }) => (
  <button className={`${styles.animaleCard} ${selezionato ? styles.animaleCardSel : ""}`} onClick={onClick}>
    <div className={styles.animaleImg}>{a.immagineDisegno && <img src={a.immagineDisegno} alt={a.nome} />}</div>
    <span className={styles.animaleNome}>{a.nome}</span>
  </button>
);

export default function Configura() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <ConfiguraInner />
    </Suspense>
  );
}
