import { Instagram, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-3xl font-semibold text-foreground mb-2">Abruzzo</h3>
            <p className="text-sm text-muted-foreground">Barbería</p>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Contacto
            </p>
            <div className="space-y-3">
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href="https://instagram.com/abruzzo.barberia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
              >
                <Instagram className="h-4 w-4" />
                @abruzzo.barberia
              </a>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Dirección
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Calle Ejemplo 1234<br />
              Buenos Aires, Argentina
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Abruzzo Barbería. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
