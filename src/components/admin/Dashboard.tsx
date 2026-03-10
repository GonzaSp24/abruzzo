import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Scissors, TrendingUp } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardProps {
  appointments: any[];
  barbers: any[];
  services: any[];
}

export default function Dashboard({ appointments, barbers, services }: DashboardProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const stats = useMemo(() => {
    const active = appointments.filter(a => a.status !== "cancelled");
    const todayCount = active.filter(a => a.appointment_date === today).length;
    const weekCount = active.filter(a => {
      const d = parseISO(a.appointment_date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    }).length;
    const pending = appointments.filter(a => a.status === "pending").length;
    const completed = appointments.filter(a => a.status === "completed").length;
    return { todayCount, weekCount, pending, completed, total: active.length };
  }, [appointments, today]);

  const barberStats = useMemo(() => {
    const active = appointments.filter(a => a.status !== "cancelled");
    const map = new Map<string, { name: string; count: number; revenue: number }>();
    active.forEach(a => {
      const name = a.barbers?.name || "Sin asignar";
      const prev = map.get(name) || { name, count: 0, revenue: 0 };
      prev.count += 1;
      prev.revenue += a.services?.price || 0;
      map.set(name, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [appointments]);

  const serviceStats = useMemo(() => {
    const active = appointments.filter(a => a.status !== "cancelled");
    const map = new Map<string, { name: string; count: number }>();
    active.forEach(a => {
      const name = a.services?.name || "Desconocido";
      const prev = map.get(name) || { name, count: 0 };
      prev.count += 1;
      map.set(name, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [appointments]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .filter(a => a.status !== "cancelled")
      .sort((a, b) => {
        const da = `${a.appointment_date}T${a.appointment_time}`;
        const db = `${b.appointment_date}T${b.appointment_time}`;
        return da > db ? -1 : 1;
      })
      .slice(0, 10);
  }, [appointments]);

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
  };
  const statusStyle: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    confirmed: "bg-accent/20 text-accent",
    completed: "bg-secondary text-secondary-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hoy</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground">turnos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Esta semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.weekCount}</div>
            <p className="text-xs text-muted-foreground">turnos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">por confirmar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completados</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">total histórico</p>
          </CardContent>
        </Card>
      </div>

      {/* Barber + Service breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Turnos por barbero</CardTitle>
          </CardHeader>
          <CardContent>
            {barberStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos aún.</p>
            ) : (
              <div className="space-y-3">
                {barberStats.map(b => (
                  <div key={b.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{b.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{b.count} turnos</span>
                      <span className="text-sm font-medium">${b.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Servicios más pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos aún.</p>
            ) : (
              <div className="space-y-3">
                {serviceStats.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-sm text-muted-foreground">{s.count} turnos</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos turnos</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay turnos registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Barbero</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAppointments.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.appointment_date}</TableCell>
                    <TableCell>{a.appointment_time}</TableCell>
                    <TableCell>{a.client_name}</TableCell>
                    <TableCell>{a.barbers?.name}</TableCell>
                    <TableCell>{a.services?.name}</TableCell>
                    <TableCell>
                      <Badge className={statusStyle[a.status] || ""}>
                        {statusLabel[a.status] || a.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
