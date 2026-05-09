import { NextResponse } from "next/server";

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

  const query = `{
    products(first: 10) {
      edges {
        node {
          id
          title
          variants(first: 3) {
            edges {
              node {
                id
                title
                price { amount }
              }
            }
          }
        }
      }
    }
  }`;

  const res = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token!,
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
