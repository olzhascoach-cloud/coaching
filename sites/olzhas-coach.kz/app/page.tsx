import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import CredibilityBar from "@/components/sections/CredibilityBar";
import OwnerProblems from "@/components/sections/OwnerProblems";
import Difference from "@/components/sections/Difference";
import Ventures from "@/components/sections/Ventures";
import Method from "@/components/sections/Method";
import Services from "@/components/sections/Services";
import Qualification from "@/components/sections/Qualification";
import Cases from "@/components/sections/Cases";
import Books from "@/components/sections/Books";
import PersonalStory from "@/components/sections/PersonalStory";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CredibilityBar />
        <OwnerProblems />
        <Difference />
        <Ventures />
        <Method />
        <Services />
        <Qualification />
        <Cases />
        <Books />
        <PersonalStory />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
