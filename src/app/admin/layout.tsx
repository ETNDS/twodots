"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "@styles/adminLayout.module.css";

const GRUPPI = [
  {
    label: "Catalogo",
    prefissi: ["/admin/animali", "/admin/animale", "/admin/recensioni"],
    voci: [
      { href: "/admin/animali", label: "Animali", match: (p: string) => p.startsWith("/admin/animali") || p.startsWith("/admin/animale") },
      { href: "/admin/recensioni", label: "Recensioni", match: (p: string) => p.startsWith("/admin/recensioni") },
    ],
  },
  {
    label: "Configuratore",
    prefissi: ["/admin/cristalli", "/admin/cordini", "/admin/smalti", "/admin/resina", "/admin/font", "/admin/confezioni"],
    voci: [
      { href: "/admin/cristalli", label: "Cristalli", match: (p: string) => p.startsWith("/admin/cristalli") },
      { href: "/admin/cordini", label: "Cordini", match: (p: string) => p.startsWith("/admin/cordini") },
      { href: "/admin/smalti", label: "Smalti", match: (p: string) => p.startsWith("/admin/smalti") },
      { href: "/admin/resina", label: "Resina", match: (p: string) => p.startsWith("/admin/resina") },
      { href: "/admin/font", label: "Font dedica", match: (p: string) => p.startsWith("/admin/font") },
      { href: "/admin/confezioni", label: "Confezioni", match: (p: string) => p.startsWith("/admin/confezioni") },
    ],
  },
  {
    label: "PET",
    prefissi: ["/admin/pet"],
    voci: [
      { href: "/admin/pet", label: "Ciondolo PET", match: (p: string) => p.startsWith("/admin/pet") && !p.startsWith("/admin/pet-sizes") },
      { href: "/admin/pet-sizes", label: "Taglie PET", match: (p: string) => p.startsWith("/admin/pet-sizes") },
    ],
  },
  {
    label: "Sconti",
    prefissi: ["/admin/sconti"],
    voci: [
      { href: "/admin/sconti", label: "Sconti YOU", match: (p: string) => p.startsWith("/admin/sconti") && !p.startsWith("/admin/sconti-pet") },
      { href: "/admin/sconti-pet", label: "Sconti PET", match: (p: string) => p.startsWith("/admin/sconti-pet") },
    ],
  },
  {
    label: "Impostazioni",
    prefissi: ["/admin/faq", "/admin/impostazioni"],
    voci: [
      { href: "/admin/faq", label: "FAQ", match: (p: string) => p.startsWith("/admin/faq") },
      { href: "/admin/impostazioni", label: "Impostazioni", match: (p: string) => p.startsWith("/admin/impostazioni") },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [aperto, setAperto] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  // Apre automaticamente il gruppo che contiene la pagina corrente
  useEffect(() => {
    const idx = GRUPPI.findIndex(g =>
      g.prefissi.some(p => pathname.startsWith(p))
    );
    setAperto(idx >= 0 ? idx : null);
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !isLoginPage) router.push("/admin/login");
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router, isLoginPage]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/admin/login");
  }

  function toggleGruppo(idx: number) {
    setAperto(prev => prev === idx ? null : idx);
  }

  if (checking) return null;
  if (isLoginPage) return <>{children}</>;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarLogo}>TWO DOTS</p>
        <nav className={styles.nav}>
          {GRUPPI.map((gruppo, idx) => {
            const isOpen = aperto === idx;
            const isActive = gruppo.prefissi.some(p => pathname.startsWith(p));
            return (
              <div key={gruppo.label} className={styles.navGroup}>
                <button
                  className={`${styles.navGroupBtn} ${isActive ? styles.navGroupBtnActive : ""}`}
                  onClick={() => toggleGruppo(idx)}
                >
                  <span>{gruppo.label}</span>
                  <span className={styles.navGroupArrow}>{isOpen ? "▾" : "›"}</span>
                </button>
                {isOpen && (
                  <div className={styles.navGroupItems}>
                    {gruppo.voci.map(v => (
                      <Link
                        key={v.href}
                        href={v.href}
                        className={`${styles.navLink} ${v.match(pathname) ? styles.navLinkActive : ""}`}
                      >
                        {v.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
