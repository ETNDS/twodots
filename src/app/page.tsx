import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import Hero from "@/components/Hero";
import Origin from "@/components/Origin";
import HumPet from "@/components/HumPet";
import Animals from "@/components/Animals";
import Configurator from "@/components/Configurator";
import RecensioniHome from "@/components/RecensioniHome";
import styles from "@styles/page.module.css";

export default function Home() {
  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <Hero />
        <Origin />
        <HumPet />
        <Animals />
        <Configurator />
        <RecensioniHome />
      </main>
      <Footer />
    </>
  );
}
