const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
import { SHOPIFY_VARIANT_IDS } from "@/config/shopify";

const VARIANT_IDS = SHOPIFY_VARIANT_IDS;

async function shopifyFetch(query: string, variables?: object) {
  const res = await fetch(`https://${DOMAIN}/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export async function creaCarrello(righe: {
  variantId: string;
  quantity: number;
  attributes?: { key: string; value: string }[];
}[]) {
  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch(query, {
    input: {
      lines: righe.map(r => ({
        merchandiseId: r.variantId,
        quantity: r.quantity,
        attributes: r.attributes || [],
      })),
    },
  });

  if (!data?.data?.cartCreate?.cart) {
    console.error("Shopify cartCreate error:", JSON.stringify(data));
    return null;
  }

  return data.data.cartCreate.cart;
}

export async function cartApplyDiscount(cartId: string, codice: string): Promise<void> {
  const query = `
    mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
      cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart {
          id
          discountCodes {
            code
            applicable
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  await shopifyFetch(query, { cartId, discountCodes: [codice] });
}

export type ConfigurazioneCarrello = {
  animale: string;
  coloreCiondolo: string;
  disegno: string;
  swarovskiSx: string;
  swarovskiDx: string;
  cordino: string;
  dedicaHum: string;
  aggiungPet: boolean;
  coloreCiondoloPet: string;
  swarovskiSxPet: string;
  swarovskiDxPet: string;
  dedicaPet: string;
  confezione: string;
  confezioneVariantId: string | null;
  quantita?: number;
};

export function buildRigheCarrello(c: ConfigurazioneCarrello) {
  const qty = c.quantita ?? 1;

  const righe: {
    variantId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[] = [];

  // HUM
  righe.push({
    variantId: VARIANT_IDS.hum,
    quantity: qty,
    attributes: [
      { key: "Animale", value: c.animale },
      { key: "Colore ciondolo", value: c.coloreCiondolo },
      { key: "Colore disegno", value: c.disegno },
      { key: "Swarovski occhio sx", value: c.swarovskiSx },
      { key: "Swarovski occhio dx", value: c.swarovskiDx },
      { key: "Cordino", value: c.cordino },
      ...(c.dedicaHum ? [{ key: "Dedica", value: c.dedicaHum }] : []),
    ],
  });

  // PET
  if (c.aggiungPet) {
    righe.push({
      variantId: VARIANT_IDS.pet,
      quantity: qty,
      attributes: [
        { key: "Colore ciondolo", value: c.coloreCiondoloPet },
        { key: "Swarovski occhio sx", value: c.swarovskiSxPet },
        { key: "Swarovski occhio dx", value: c.swarovskiDxPet },
        ...(c.dedicaPet ? [{ key: "Dedica", value: c.dedicaPet }] : []),
      ],
    });
  }

  // Confezione
  if (c.confezioneVariantId) {
    righe.push({ variantId: c.confezioneVariantId, quantity: qty });
  }

  // Dedica YOU — prezzo intero
  if (c.dedicaHum) {
    righe.push({ variantId: VARIANT_IDS.dedica, quantity: qty });
  }

  // Dedica PET — scontata se c'è dedica HUM, prezzo intero altrimenti
  if (c.aggiungPet && c.dedicaPet) {
    const variantDedicaPet = c.dedicaHum
      ? VARIANT_IDS.dedicaScontata
      : VARIANT_IDS.dedica;
    righe.push({ variantId: variantDedicaPet, quantity: qty });
  }

  return righe;
}
