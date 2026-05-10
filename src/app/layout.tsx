import { Inter } from "next/font/google";
import { metadata as siteMetadata } from "@/config/metadata";
import { CarrelloProvider } from "@/lib/carrello";
import "@styles/globals.css";

export const metadata = siteMetadata;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <CarrelloProvider>
          {children}
        </CarrelloProvider>
      </body>
    </html>
  );
}
