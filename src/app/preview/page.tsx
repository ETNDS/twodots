import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Origin from "@/components/Origin";
import HumPet from "@/components/HumPet";
import Animals from "@/components/Animals";
import Configurator from "@/components/Configurator";
import Footer from "@/components/Footer";
import styles from "@styles/page.module.css";
import BackgroundLogo from "@/components/BackgroundLogo";

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
      </main>
      <Footer />
    </>
  );
}
