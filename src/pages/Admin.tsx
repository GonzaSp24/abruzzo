import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Loader2, Trash2, CheckCircle, XCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        toast.error("No tenés permisos de administrador");
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Queries
  const { data: appointments } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, barbers(name), services(name, price)")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  const { data: barbers } = useQuery({
    queryKey: ["admin-barbers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("barbers").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  const { data: services } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !loading,
  });

  // Mutations
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-appointments"] }),
  });

  const updateService = useMutation({
    mutationFn: async ({ id, price, duration }: { id: string; price: number; duration: number }) => {
      const { error } = await supabase.from("services").update({ price, duration }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Servicio actualizado");
    },
  });

  const addBarber = useMutation({
    mutationFn: async ({ name, role }: { name: string; role: string }) => {
      const { error } = await supabase.from("barbers").insert({ name, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-barbers"] });
      toast.success("Barbero agregado");
    },
  });

  const deleteBarber = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("barbers").update({ active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-barbers"] });
      toast.success("Barbero eliminado");
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments?.filter(a => a.appointment_date === todayStr) || [];
  const upcomingAppointments = appointments?.filter(a => a.appointment_date >= todayStr && a.status !== "cancelled") || [];

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-muted text-muted-foreground",
      confirmed: "bg-accent/20 text-accent",
      completed: "bg-secondary text-secondary-foreground",
      cancelled: "bg-destructive/10 text-destructive",
    };
    const labels: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return <Badge className={styles[status] || ""}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Abruzzo — Admin
          </h1>
          <Button variant="ghost" onClick={handleLogout} className="gap-2 text-sm">
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="turnos">
          <TabsList className="mb-8">
            <TabsTrigger value="turnos">Turnos ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="barberos">Barberos</TabsTrigger>
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
          </TabsList>

          {/* Appointments */}
          <TabsContent value="turnos">
            <h2 className="text-2xl font-semibold mb-4">Turnos del día ({todayAppointments.length})</h2>
            <AppointmentsTable
              appointments={todayAppointments}
              statusBadge={statusBadge}
              onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
            />
            <h2 className="text-2xl font-semibold mb-4 mt-10">Próximos turnos</h2>
            <AppointmentsTable
              appointments={upcomingAppointments}
              statusBadge={statusBadge}
              onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
            />
          </TabsContent>

          {/* Barbers */}
          <TabsContent value="barberos">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Barberos</h2>
              <AddBarberDialog onAdd={(name, role) => addBarber.mutate({ name, role })} />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barbers?.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.role}</TableCell>
                    <TableCell>{b.active ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell className="text-right">
                      {b.active && (
                        <Button variant="ghost" size="icon" onClick={() => deleteBarber.mutate(b.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Services */}
          <TabsContent value="servicios">
            <h2 className="text-2xl font-semibold mb-6">Servicios</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Duración (min)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map(s => (
                  <ServiceRow key={s.id} service={s} onUpdate={(price, duration) => updateService.mutate({ id: s.id, price, duration })} />
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Sub-components
function AppointmentsTable({ appointments, statusBadge, onUpdateStatus }: {
  appointments: any[];
  statusBadge: (s: string) => JSX.Element;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  if (appointments.length === 0) return <p className="text-muted-foreground text-sm">No hay turnos.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Barbero</TableHead>
          <TableHead>Servicio</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((a: any) => (
          <TableRow key={a.id}>
            <TableCell>{a.appointment_date}</TableCell>
            <TableCell>{a.appointment_time}</TableCell>
            <TableCell>
              <div>{a.client_name}</div>
              <div className="text-xs text-muted-foreground">{a.client_phone}</div>
            </TableCell>
            <TableCell>{a.barbers?.name}</TableCell>
            <TableCell>{a.services?.name}</TableCell>
            <TableCell>{statusBadge(a.status)}</TableCell>
            <TableCell className="text-right space-x-1">
              {a.status === "pending" && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => onUpdateStatus(a.id, "confirmed")}>
                    <CheckCircle className="h-4 w-4 text-accent" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onUpdateStatus(a.id, "cancelled")}>
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
              {a.status === "confirmed" && (
                <Button variant="ghost" size="icon" onClick={() => onUpdateStatus(a.id, "completed")}>
                  <CheckCircle className="h-4 w-4 text-accent" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ServiceRow({ service, onUpdate }: { service: any; onUpdate: (price: number, duration: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(service.price);
  const [duration, setDuration] = useState(service.duration);

  return (
    <TableRow>
      <TableCell className="font-medium">{service.name}</TableCell>
      <TableCell>
        {editing ? (
          <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-24 rounded-none" />
        ) : (
          `$${service.price.toLocaleString()}`
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-20 rounded-none" />
        ) : (
          `${service.duration} min`
        )}
      </TableCell>
      <TableCell className="text-right">
        {editing ? (
          <Button size="sm" variant="outline" onClick={() => { onUpdate(price, duration); setEditing(false); }}>
            Guardar
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Editar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function AddBarberDialog({ onAdd }: { onAdd: (name: string, role: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Barbero");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-none text-xs tracking-[0.1em] uppercase">
          <Plus className="h-4 w-4" /> Agregar Barbero
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Barbero</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} className="rounded-none" />
          <Input placeholder="Rol (ej: Barbero Senior)" value={role} onChange={e => setRole(e.target.value)} className="rounded-none" />
          <Button
            onClick={() => { onAdd(name, role); setOpen(false); setName(""); setRole("Barbero"); }}
            disabled={!name.trim()}
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
          >
            Agregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Admin;
