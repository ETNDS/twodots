"use client";

import { useEffect, useState } from "react";
import styles from "@styles/backgroundLogo.module.css";

export default function BackgroundLogo() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!isDesktop) return null;

  return (
    <>
      <div className={styles.left}>
        <img src="/images/twodots-logo-left.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "right center" }} />
      </div>
      <div className={styles.right}>
        <img src="/images/twodots-logo-right.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center" }} />
      </div>
    </>
  );
}
