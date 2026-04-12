import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  title: "TwoDots – Coming Soon",
  description: "Stiamo arrivando con il nuovo ecommerce TwoDots.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
