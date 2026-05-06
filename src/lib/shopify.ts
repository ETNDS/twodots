const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
const apiVersion = "2025-01";

export async function shopifyFetch(query: string) {
  const response = await fetch(
    `https://${domain}/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query }),
    }
  );
  return response.json();
}

export async function getProducts() {
  const query = `{
    products(first: 10) {
      edges {
        node {
          id
          title
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }`;
  return shopifyFetch(query);
}
