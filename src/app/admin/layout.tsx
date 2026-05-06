"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
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

  if (checking) return null;
  if (isLoginPage) return <>{children}</>;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <p className={styles.sidebarLogo}>TWO DOTS</p>
        <nav className={styles.nav}>
          <Link
            href="/admin/animali"
            className={`${styles.navLink} ${pathname.startsWith("/admin/animali") || pathname.startsWith("/admin/animale") ? styles.navLinkActive : ""}`}
          >
            Animali
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/admin/login" className={styles.logoutLink}>Logout</Link>
        </div>
      </aside>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
