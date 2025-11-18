import Header from "@/components/Header";
import Banner from "@/components/Banner";
import ParaVoceSection from "@/components/ParaVoceSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Banner />
      {/* NOVA SEÇÃO IGUAL A SHEIN */}
      <ParaVoceSection />

      <Footer />
    </main>
  );
}
