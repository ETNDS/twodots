import { getProducts } from "@/lib/shopify";

export default async function Shop() {
  const data = await getProducts();
  const products = data?.data?.products?.edges ?? [];

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Shop (dev)</h1>
      {products.map(({ node }: any) => (
        <div key={node.id} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h2>{node.title}</h2>
          {node.variants.edges.map(({ node: variant }: any) => (
            <p key={variant.id}>
              {variant.title} — {variant.price.amount} {variant.price.currencyCode}
            </p>
          ))}
        </div>
      ))}
    </main>
  );
}
