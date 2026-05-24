import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import Hero from "@/components/Hero";
import HumPet from "@/components/HumPet";
import Animals from "@/components/Animals";
import MaterialiDettagli from "@/components/MaterialiDettagli";
import Configurator from "@/components/Configurator";
import RecensioniHome from "@/components/RecensioniHome";
import Origin from "@/components/Origin";
import CtaFinale from "@/components/CtaFinale";
import styles from "@styles/page.module.css";

export default function Home() {
  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <Hero />
        <HumPet />
        <Animals />
        <MaterialiDettagli />
        <Configurator />
        <RecensioniHome />
        <Origin />
        <CtaFinale />
      </main>
      <Footer />
    </>
  );
}
