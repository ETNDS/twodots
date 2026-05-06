"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function FirebaseTest() {
  const [stato, setStato] = useState("...");

  useEffect(() => {
    async function test() {
      try {
        await getDocs(collection(db, "test"));
        setStato("✅ Connessione Firebase OK");
      } catch (e) {
        setStato("❌ Errore: " + String(e));
      }
    }
    test();
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Firebase Test</h1>
      <p>{stato}</p>
    </main>
  );
}
