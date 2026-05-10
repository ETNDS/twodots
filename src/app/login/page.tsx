"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@styles/login.module.css";

function LoginInner() {
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/home";

  async function handleLogin() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push(from);
    } else {
      setErrore(true);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.box}>
        <p className={styles.label}>TWO DOTS</p>
        <h1 className={styles.titolo}>Accesso anticipato</h1>
        <p className={styles.testo}>Il sito è in fase di sviluppo. Inserisci la password per accedere.</p>
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrore(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        {errore && <p className={styles.errore}>Password errata.</p>}
        <button className={styles.btn} onClick={handleLogin}>Entra</button>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <LoginInner />
    </Suspense>
  );
}
