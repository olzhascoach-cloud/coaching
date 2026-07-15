import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Cases from "@/components/sections/Cases";
import Books from "@/components/sections/Books";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Cases />
        <Books />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
