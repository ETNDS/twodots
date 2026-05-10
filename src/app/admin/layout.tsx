"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "@styles/adminLayout.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !isLoginPage) {
        router.push("/admin/login");
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router, isLoginPage]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/admin/login");
  }

  if (checking) return null;
  if (isLoginPage) return <>{children}</>;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarLogo}>TWO DOTS</p>
        <nav className={styles.nav}>
          <Link href="/admin/recensioni" className={`${styles.navLink} ${pathname.startsWith("/admin/recensioni") ? styles.navLinkActive : ""}`}>
            Recensioni
          </Link>
          <Link href="/admin/animali" className={`${styles.navLink} ${pathname.startsWith("/admin/animali") || pathname.startsWith("/admin/animale") ? styles.navLinkActive : ""}`}>
            Animali
          </Link>
          <Link href="/admin/cristalli" className={`${styles.navLink} ${pathname.startsWith("/admin/cristalli") ? styles.navLinkActive : ""}`}>
            Cristalli
          </Link>
          <Link href="/admin/cordini" className={`${styles.navLink} ${pathname.startsWith("/admin/cordini") ? styles.navLinkActive : ""}`}>
            Cordini
          </Link>
          <Link href="/admin/smalti" className={`${styles.navLink} ${pathname.startsWith("/admin/smalti") ? styles.navLinkActive : ""}`}>
            Smalti
          </Link>
          <Link href="/admin/font" className={`${styles.navLink} ${pathname.startsWith("/admin/font") ? styles.navLinkActive : ""}`}>
            Font dedica
          </Link>
          <Link href="/admin/confezioni" className={`${styles.navLink} ${pathname.startsWith("/admin/confezioni") ? styles.navLinkActive : ""}`}>
            Confezioni
          </Link>
          <Link href="/admin/pet" className={`${styles.navLink} ${pathname.startsWith("/admin/pet") ? styles.navLinkActive : ""}`}>
            Ciondolo PET
          </Link>
          <Link href="/admin/impostazioni" className={`${styles.navLink} ${pathname.startsWith("/admin/impostazioni") ? styles.navLinkActive : ""}`}>
            Impostazioni
          </Link>
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
