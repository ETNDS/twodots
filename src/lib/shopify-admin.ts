// src/lib/shopify-admin.ts
// Usa Shopify Admin API (server-side only) per creare Draft Orders con prezzi custom.
// NON importare questo file in componenti client — solo in API routes Next.js.

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;

export type RigaDraftOrder = {
  title: string;
  price: string;
  quantity: number;
  properties?: { name: string; value: string }[];
};

export type DraftOrderInput = {
  righe: RigaDraftOrder[];
  scontoFisso?: number;
  titoloSconto?: string;
  redirectUrl?: string;
  note?: string;
};

export async function creaDraftOrder(input: DraftOrderInput): Promise<{ checkoutUrl: string } | null> {
  const lineItems = input.righe.map(r => ({
    title: r.title,
    price: r.price,
    quantity: r.quantity,
    requires_shipping: false,
    taxable: false,
    ...(r.properties && r.properties.length > 0 ? { properties: r.properties } : {}),
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://2dotsmilano.it";

  const body = {
    draft_order: {
      line_items: lineItems,
      ...(input.scontoFisso && input.scontoFisso > 0 ? {
        applied_discount: {
          description: input.titoloSconto || "Sconto",
          value_type: "fixed_amount",
          value: input.scontoFisso.toFixed(2),
          amount: input.scontoFisso.toFixed(2),
          title: input.titoloSconto || "Sconto",
        },
      } : {}),
      redirect_url: `${siteUrl}/grazie`,
      ...(input.note ? { note: input.note } : {}),
    },
  };

  console.log("[shopify-admin] Sending draft order:", JSON.stringify(body).slice(0, 500));

  const res = await fetch(
    `https://${DOMAIN}/admin/api/2024-10/draft_orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify(body),
    }
  );

  const responseText = await res.text();
  console.log("[shopify-admin] Response status:", res.status);
  console.log("[shopify-admin] Response body:", responseText.slice(0, 500));

  if (!res.ok) {
    console.error("[shopify-admin] Error:", responseText);
    return null;
  }

  let data: any;
  try { data = JSON.parse(responseText); } catch {
    console.error("[shopify-admin] Failed to parse response");
    return null;
  }

  const url = data?.draft_order?.invoice_url || data?.draft_order?.checkout_url;
  if (!url) {
    console.error("[shopify-admin] No URL in response:", JSON.stringify(data).slice(0, 300));
    return null;
  }

  return { checkoutUrl: url };
}
