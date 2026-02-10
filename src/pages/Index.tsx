import { useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import Team from "@/components/landing/Team";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const navigate = useNavigate();
  const handleReservar = () => navigate("/reservar");

  return (
    <div className="min-h-screen bg-background">
      <Navbar onReservar={handleReservar} />
      <main>
        <Hero onReservar={handleReservar} />
        <Services />
        <Team />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
