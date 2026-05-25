"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SOCIAL, CONTACT } from "@/config/constants";
import BackgroundLogo from "@/components/BackgroundLogo";
import IconInstagram from "@/components/IconInstagram";
import IconFacebook from "@/components/IconFacebook";
import styles from "@styles/contatti.module.css";

export default function Contatti() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [stato, setStato] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStato("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, messaggio }),
      });

      if (res.ok) {
        setStato("success");
        setNome("");
        setEmail("");
        setMessaggio("");
      } else {
        setStato("error");
      }
    } catch {
      setStato("error");
    }
  }

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.label}>CONTATTI</p>
          <h1 className={styles.title}>Hai una richiesta speciale?</h1>
          <p className={styles.sub}>
            Un soggetto che non trovi, una dedica particolare, un bijoux YOU &amp; PET, un&apos;idea regalo, un preventivo per ordini multipli. Scrivici — rispondiamo a tutti.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Nome</label>
            <input
              className={styles.input}
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Il tuo nome"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="La tua email"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Messaggio</label>
            <textarea
              className={styles.textarea}
              value={messaggio}
              onChange={(e) => setMessaggio(e.target.value)}
              placeholder="Scrivici quello che vuoi..."
              rows={5}
              required
            />
          </div>

          <button
            className={styles.btn}
            type="submit"
            disabled={stato === "loading"}
          >
            {stato === "loading" ? "Invio..." : "Invia messaggio"}
          </button>

          {stato === "success" && (
            <p className={styles.success}>Messaggio inviato. Ti risponderemo presto.</p>
          )}
          {stato === "error" && (
            <p className={styles.error}>Qualcosa non ha funzionato. Riprova o scrivici direttamente.</p>
          )}
        </form>

        <div className={styles.alternative}>
          <p className={styles.altText}>Preferisci scriverci direttamente?</p>
          <a className={styles.altLink} href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <p className={styles.altText} style={{ marginTop: "16px" }}>Seguici su Instagram</p>
          <a className={styles.altLink} href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconInstagram size={16} />
            {SOCIAL.instagramHandle}
          </a>
          <p className={styles.altText} style={{ marginTop: "16px" }}>Seguici su Facebook</p>
          <a className={styles.altLink} href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconFacebook size={16} />
            twodotsdesign
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
