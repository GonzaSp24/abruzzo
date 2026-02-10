import { motion } from "framer-motion";
import { Scissors, Droplets, Brush } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, typeof Scissors> = {
  "Corte": Scissors,
  "Corte y Lavado": Droplets,
  "Barba": Brush,
  "Corte + Barba": Scissors,
};

const Services = () => {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="servicios" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Lo que ofrecemos
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground">
            Nuestros Servicios
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services?.map((service, index) => {
            const Icon = iconMap[service.name] || Scissors;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group border border-border p-8 hover:border-accent transition-colors duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Icon className="h-5 w-5 text-accent mb-4" />
                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{service.duration} min</p>
                  </div>
                  <span className="text-2xl font-light text-foreground">
                    ${service.price.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
