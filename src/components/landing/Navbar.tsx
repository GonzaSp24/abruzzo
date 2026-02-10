import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onReservar: () => void;
}

const Navbar = ({ onReservar }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
        scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border py-4" : "py-6"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Abruzzo
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#servicios" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">
            Servicios
          </a>
          <a href="#equipo" className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">
            Equipo
          </a>
          <Button
            onClick={onReservar}
            variant="outline"
            className="rounded-none text-xs tracking-[0.15em] uppercase border-foreground text-foreground hover:bg-foreground hover:text-background"
          >
            Reservar
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-border pt-4">
          <a href="#servicios" className="block text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>
            Servicios
          </a>
          <a href="#equipo" className="block text-sm text-muted-foreground" onClick={() => setMenuOpen(false)}>
            Equipo
          </a>
          <Button
            onClick={() => { onReservar(); setMenuOpen(false); }}
            className="w-full rounded-none text-xs tracking-[0.15em] uppercase"
          >
            Reservar Turno
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
