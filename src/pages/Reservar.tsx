import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, Check, User, MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { z } from "zod";

const clientNameSchema = z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres");
const clientPhoneSchema = z.string().trim().min(1, "El teléfono es obligatorio").max(20, "Máximo 20 caracteres").regex(/^[0-9+\-() ]+$/, "Formato de teléfono inválido");

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30",
];

const steps = ["Barbero", "Servicio", "Fecha y Hora", "Tus Datos", "Confirmación"];

const Reservar = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const { data: barbers } = useQuery({
    queryKey: ["barbers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("barbers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createAppointment = useMutation({
    mutationFn: async () => {
      if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) throw new Error("Missing data");
      const { error } = await supabase.from("appointments").insert({
        barber_id: selectedBarber,
        service_id: selectedService,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setStep(4);
    },
    onError: () => {
      toast.error("Error al reservar. Intentá de nuevo.");
    },
  });

  const canNext = () => {
    switch (step) {
      case 0: return !!selectedBarber;
      case 1: return !!selectedService;
      case 2: return !!selectedDate && !!selectedTime;
      case 3: return clientName.trim().length > 0 && clientPhone.trim().length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 3) {
      const nameResult = clientNameSchema.safeParse(clientName);
      const phoneResult = clientPhoneSchema.safeParse(clientPhone);
      setNameError(nameResult.success ? "" : nameResult.error.errors[0].message);
      setPhoneError(phoneResult.success ? "" : phoneResult.error.errors[0].message);
      if (!nameResult.success || !phoneResult.success) return;
      createAppointment.mutate();
    } else {
      setStep(s => s + 1);
    }
  };

  const barber = barbers?.find(b => b.id === selectedBarber);
  const service = services?.find(s => s.id === selectedService);

  const whatsappMessage = () => {
    const dateStr = selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : "";
    return encodeURIComponent(
      `Hola! Reservé un turno en Abruzzo para ${service?.name} con ${barber?.name} el ${dateStr} a las ${selectedTime}. Mi nombre es ${clientName}.`
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Reservar Turno
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Steps indicator */}
      <div className="px-6 py-6 border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                i < step ? "bg-accent text-accent-foreground" :
                i === step ? "bg-foreground text-background" :
                "bg-muted text-muted-foreground"
              )}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className="hidden md:inline text-xs text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div>
                  <h2 className="text-3xl font-semibold text-foreground mb-2">Elegí tu barbero</h2>
                  <p className="text-muted-foreground mb-8">Seleccioná con quién querés atenderte.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {barbers?.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBarber(b.id)}
                        className={cn(
                          "border p-6 text-center transition-all duration-200",
                          selectedBarber === b.id ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <div className="w-20 h-20 mx-auto mb-4 bg-muted flex items-center justify-center">
                          {b.photo_url ? (
                            <img src={b.photo_url} alt={b.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-8 w-8 text-muted-foreground/40" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">{b.name}</h3>
                        <p className="text-xs text-muted-foreground">{b.role}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-3xl font-semibold text-foreground mb-2">Elegí el servicio</h2>
                  <p className="text-muted-foreground mb-8">¿Qué te gustaría hacerte?</p>
                  <div className="space-y-4">
                    {services?.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedService(s.id)}
                        className={cn(
                          "w-full border p-6 flex items-center justify-between transition-all duration-200 text-left",
                          selectedService === s.id ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{s.name}</h3>
                          <p className="text-xs text-muted-foreground">{s.duration} min</p>
                        </div>
                        <span className="text-xl font-light text-foreground">${s.price.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-3xl font-semibold text-foreground mb-2">Elegí fecha y hora</h2>
                  <p className="text-muted-foreground mb-8">Seleccioná cuándo querés venir.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="pointer-events-auto"
                        locale={es}
                      />
                    </div>
                    {selectedDate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "py-2 text-sm border transition-colors",
                                selectedTime === time ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-muted-foreground"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-3xl font-semibold text-foreground mb-2">Tus datos</h2>
                  <p className="text-muted-foreground mb-8">Así podemos contactarte si es necesario.</p>
                  <div className="max-w-md space-y-6">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Nombre</label>
                      <Input value={clientName} onChange={(e) => { setClientName(e.target.value); setNameError(""); }} placeholder="Tu nombre" className="rounded-none" maxLength={100} />
                      {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">WhatsApp</label>
                      <Input value={clientPhone} onChange={(e) => { setClientPhone(e.target.value); setPhoneError(""); }} placeholder="+54 11 1234-5678" className="rounded-none" maxLength={20} />
                      {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <Check className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-3xl font-semibold text-foreground mb-2">¡Turno reservado!</h2>
                  <p className="text-muted-foreground mb-8">Revisá el resumen de tu turno.</p>
                  <div className="max-w-sm mx-auto border border-border p-8 mb-8 text-left space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Barbero</p>
                      <p className="text-foreground font-medium">{barber?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Servicio</p>
                      <p className="text-foreground font-medium">{service?.name} — ${service?.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Fecha y hora</p>
                      <p className="text-foreground font-medium">
                        {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Cliente</p>
                      <p className="text-foreground font-medium">{clientName}</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/5491100000000?text=${whatsappMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="rounded-none text-xs tracking-[0.15em] uppercase px-8 py-5 gap-2 bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-accent-foreground">
                      <MessageCircle className="h-4 w-4" />
                      Confirmar por WhatsApp
                    </Button>
                  </a>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 4 && (
            <div className="flex justify-between mt-12">
              <Button
                variant="ghost"
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-none text-xs tracking-[0.1em] uppercase gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canNext() || createAppointment.isPending}
                className="rounded-none text-xs tracking-[0.1em] uppercase gap-2 bg-foreground text-background hover:bg-foreground/90"
              >
                {createAppointment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>{step === 3 ? "Confirmar" : "Siguiente"} <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservar;
