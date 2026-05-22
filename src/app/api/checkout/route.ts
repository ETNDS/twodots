// src/app/api/checkout/route.ts
export const runtime = "nodejs";
// API route server-side: riceve il carrello, costruisce la Draft Order con prezzi da Firestore,
// la invia a Shopify Admin API e restituisce il checkoutUrl.

import { NextRequest, NextResponse } from "next/server";
import { creaDraftOrder } from "@/lib/shopify-admin";

type RigaDraftOrder = {
  title: string;
  price: string;
  quantity: number;
  properties?: { name: string; value: string }[];
};
import { ArticoloCarrello } from "@/lib/carrello";

export type CheckoutPayload = {
  articoli: ArticoloCarrello[];
  codiceSconto?: string;
  scontoYouPercentuale?: number;
};

export async function POST(req: NextRequest) {
  try {
    const payload: CheckoutPayload = await req.json();
    const { articoli, codiceSconto, scontoYouPercentuale } = payload as CheckoutPayload & { scontoYouPercentuale?: number };

    if (!articoli || articoli.length === 0) {
      return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 });
    }

    const righe: RigaDraftOrder[] = [];
    let importoScontoPetTotale = 0;

    for (const a of articoli) {
      const qty = a.quantitaHum;
      const prezzoAnimale = a.animale.prezzo || 45;
      const prezzoPet = a.animale.prezzoPet || 15;

      // ── YOU ──────────────────────────────────────────────────────────────
      righe.push({
        title: `Bijoux YOU — ${a.animale.nome}`,
        price: prezzoAnimale.toFixed(2),
        quantity: qty,
        properties: [
          { name: "Colore bijoux", value: a.coloreCiondolo === "nero" ? "Nero" : "Bianco" },
          { name: "Colore disegno", value: a.smalto.nome },
          { name: "Swarovski sx", value: a.occhioSx.nome },
          { name: "Swarovski dx", value: a.occhioDx.nome },
          { name: "Cordino", value: a.cordino.nome },
          ...(a.dedicaHum ? [{ name: "Dedica", value: a.dedicaHum }] : []),
          ...(a.fontDedicaHum ? [{ name: "Font dedica", value: a.fontDedicaHum.descrizione }] : []),
        ],
      });

      // Dedica YOU
      if (a.dedicaHum) {
        const prezzoDedicaHum = 4;
        righe.push({
          title: "Dedica bijoux YOU",
          price: prezzoDedicaHum.toFixed(2),
          quantity: qty,
        });
      }

      // Confezione
      if (a.confezione.prezzo > 0) {
        righe.push({
          title: `Confezione — ${a.confezione.nome}`,
          price: a.confezione.prezzo.toFixed(2),
          quantity: qty,
        });
      }

      // ── PET ──────────────────────────────────────────────────────────────
      for (let i = 0; i < a.pet.length; i++) {
        const pet = a.pet[i];
        const numeroPet = i + 1;

        const scontoPerc = a.scontoPetPercentuale || 0;

        // Bijoux PET a prezzo lordo
        righe.push({
          title: `Bijoux PET #${numeroPet} — ${a.animale.nome}${pet.etichettaSizePet ? ` (${pet.etichettaSizePet})` : ""}`,
          price: prezzoPet.toFixed(2),
          quantity: qty,
          properties: [
            { name: "Colore bijoux", value: pet.coloreCiondoloPet === "nero" ? "Nero" : "Bianco" },
            ...(pet.occhioSxPet ? [{ name: "Swarovski sx", value: pet.occhioSxPet.nome }] : []),
            ...(pet.occhioDxPet ? [{ name: "Swarovski dx", value: pet.occhioDxPet.nome }] : []),
            ...(pet.dedicaPet ? [{ name: "Dedica", value: pet.dedicaPet }] : []),
            ...(pet.fontDedicaPet ? [{ name: "Font dedica", value: pet.fontDedicaPet.descrizione }] : []),
          ],
        });

        // Dedica PET a prezzo lordo
        if (pet.dedicaPet) {
          const prezzoDedicaPet = a.dedicaHum ? 2 : 4;
          righe.push({
            title: `Dedica bijoux PET #${numeroPet}`,
            price: prezzoDedicaPet.toFixed(2),
            quantity: qty,
          });
        }
      }

      // Sconto PET: calcolato per applied_discount finale
      if (a.scontoPetPercentuale > 0 && a.pet.length > 0) {
        const totaleLordoPet = a.pet.reduce((acc, pet) => {
          const dedica = pet.dedicaPet ? (a.dedicaHum ? 2 : 4) : 0;
          return acc + prezzoPet + dedica;
        }, 0);
        // qty NON moltiplicato: lo sconto PET è per set, non per qty YOU
        importoScontoPetTotale += Math.round(totaleLordoPet * a.scontoPetPercentuale) / 100;
      }
    }

    // Totale lordo righe (solo prezzi positivi)
    const totaleLordo = righe.reduce((acc, r) => acc + parseFloat(r.price) * r.quantity, 0);

    // Sconto YOU sul totale dopo sconto PET
    const totaleDopoScontoPet = Math.round((totaleLordo - importoScontoPetTotale) * 100) / 100;
    const importoScontoYou = (scontoYouPercentuale && scontoYouPercentuale > 0)
      ? Math.round(totaleDopoScontoPet * scontoYouPercentuale) / 100
      : 0;

    // Arrotondamento all'unità inferiore
    const totaleDopoSconti = Math.round((totaleDopoScontoPet - importoScontoYou) * 100) / 100;
    const arrotondamento = totaleDopoSconti > Math.floor(totaleDopoSconti)
      ? Math.round((totaleDopoSconti - Math.floor(totaleDopoSconti)) * 100) / 100
      : 0;

    // Sconto totale da passare a Shopify come applied_discount
    const scontoFissoTotale = Math.round((importoScontoPetTotale + importoScontoYou + arrotondamento) * 100) / 100;

    // Descrizione sconto per Shopify
    const partiSconto: string[] = [];
    if (importoScontoPetTotale > 0) partiSconto.push(`PET`);
    if (importoScontoYou > 0) partiSconto.push(`YOU ${scontoYouPercentuale}%`);
    if (arrotondamento > 0) partiSconto.push(`arrotondamento`);
    const titoloSconto = partiSconto.length > 0 ? `Sconto ${partiSconto.join(" + ")}` : "Sconto";

    const result = await creaDraftOrder({
      righe,
      scontoFisso: scontoFissoTotale > 0 ? scontoFissoTotale : undefined,
      titoloSconto: scontoFissoTotale > 0 ? titoloSconto : undefined,
    });

    if (!result) {
      return NextResponse.json({ error: "Errore Shopify" }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: result.checkoutUrl });

  } catch (err) {
    console.error("Checkout API error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
