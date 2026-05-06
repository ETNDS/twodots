import Image from "next/image";
import { APP_VERSION, APP_YEAR } from '@/config/version';

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#ffffff",
      padding: "2rem 1.5rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: "420px", margin: "0 auto" }}>
        <Image
          src="/images/twodots-logo.png"
          alt="TwoDots Logo"
          width={260}
          height={260}
          priority
          style={{ width: "180px", height: "auto", marginBottom: "1.5rem" }}
        />
        <h1 style={{ fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "0.5rem", color: "#111" }}>
          TwoDots
        </h1>
        <p style={{ fontSize: "1.05rem", color: "#444", lineHeight: 1.5, marginBottom: "2rem", padding: "0 0.5rem" }}>
          Stiamo arrivando.<br/>
          Stiamo ultimando i prototipi per darvi un prodotto non comune e di qualità.
        </p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          Per informazioni:{" "}
          <a href="mailto:info@twodotsdesign.it" style={{ color: "#000", textDecoration: "underline" }}>
            info@twodotsdesign.it
          </a>
        </p>
        <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
          twodots - ver. {APP_VERSION} - {APP_YEAR}
        </p>
      </div>
    </main>
  );
}
