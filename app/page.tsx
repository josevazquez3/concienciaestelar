import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { QueEsSection } from "@/components/landing/QueEsSection";
import { SaltoSection } from "@/components/landing/SaltoSection";
import { IncluyeSection } from "@/components/landing/IncluyeSection";
import { MembresiaSection } from "@/components/landing/MembresiaSection";
import { TestimoniosSection } from "@/components/landing/TestimoniosSection";
import { PreciosSection } from "@/components/landing/PreciosSection";
import { FacilitadoresSection } from "@/components/landing/FacilitadoresSection";
import { ContactoSection } from "@/components/landing/ContactoSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <QueEsSection />
      <SaltoSection />
      <IncluyeSection />
      <MembresiaSection />
      <TestimoniosSection />
      <PreciosSection />
      <FacilitadoresSection />
      <ContactoSection />
      <Footer />
    </main>
  );
}
