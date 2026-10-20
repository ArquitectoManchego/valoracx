"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Star, MessageSquare, TrendingUp, AlertCircle, 
  Users, CheckCircle2, ArrowUpRight, ArrowDownRight, 
  ExternalLink, Sparkles, MapPin, Clock 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";

export default function DashboardOverviewPage() {
  const { selectedBranchId, branches, employees } = useAuth();

  // Obtener feedbacks filtrados según la sucursal seleccionada
  const feedbacks = useMemo(() => {
    return DataStore.getFeedbacks(
      selectedBranchId === "all" ? undefined : { branchId: selectedBranchId }
    );
  }, [selectedBranchId]);

  const cases = useMemo(() => {
    return DataStore.getCases(
      selectedBranchId === "all" ? undefined : selectedBranchId
    );
  }, [selectedBranchId]);

  // Cálculos de KPIs
  const totalFeedbacks = feedbacks.length;
  const averageRating = totalFeedbacks > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks).toFixed(1)
    : "5.0";

  const positiveCount = feedbacks.filter(f => f.rating >= 4).length;
  const neutralCount = feedbacks.filter(f => f.rating === 3).length;
  const negativeCount = feedbacks.filter(f => f.rating <= 2).length;
  const positivePercent = totalFeedbacks > 0 ? Math.round((positiveCount / totalFeedbacks) * 100) : 0;

  // Google Review Funnel Metrics
  const googleOffered = feedbacks.filter(f => f.googleReviewRouting.offered).length;
  const googleClicked = feedbacks.filter(f => f.googleReviewRouting.clickedAt).length;
  const googleCTR = googleOffered > 0 ? ((googleClicked / googleOffered) * 100).toFixed(1) : "0.0";

  // Casos
  const openCases = cases.filter(c => c.status === "new" || c.status === "reviewing");
  const resolvedCases = cases.filter(c => c.status === "resolved");

  // Datos para Gráfica de Distribución de Estrellas
  const starDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    feedbacks.forEach(f => {
      if (f.rating >= 1 && f.rating <= 5) counts[f.rating - 1]++;
    });
    return [
      { name: "5★", count: counts[4], color: "#10b981" },
      { name: "4★", count: counts[3], color: "#34d399" },
      { name: "3★", count: counts[2], color: "#f59e0b" },
      { name: "2★", count: counts[1], color: "#f97316" },
      { name: "1★", count: counts[0], color: "#ef4444" },
    ];
  }, [feedbacks]);

  // Datos para Evolución de Satisfacción por Días
  const evolutionData = useMemo(() => {
    const daysMap: Record<string, { sum: number; count: number }> = {};
    const last14Days: string[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(new Date("2026-10-20").getTime() - i * 24 * 3600 * 1000);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      last14Days.push(key);
      daysMap[key] = { sum: 0, count: 0 };
    }

    feedbacks.forEach(f => {
      const d = new Date(f.createdAt);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (daysMap[key]) {
        daysMap[key].sum += f.rating;
        daysMap[key].count += 1;
      }
    });

    return last14Days.map(key => ({
      date: key,
      promedio: daysMap[key].count > 0 
        ? Number((daysMap[key].sum / daysMap[key].count).toFixed(2)) 
        : 4.5,
      respuestas: daysMap[key].count,
    }));
  }, [feedbacks]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner de Bienvenida y Estado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Dashboard de Experiencia & Reputación
            </h1>
            <Badge className="bg-emerald-500 text-slate-950 font-bold border-none">
              En Vivo
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitoreo en tiempo real de satisfacción interna, enrutamiento a Google Reviews y SLAs de incidentes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/f/tk_carlos_centro_01" target="_blank">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center gap-1.5 shadow-md">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Simular Encuesta</span>
            </Button>
          </Link>
          <Link href="/dashboard/ai">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Pregúntale a tus datos</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Promedio de Satisfacción */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Satisfacción Promedio
            </CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{averageRating}</span>
                <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              </CardTitle>
              <Badge variant="success" className="text-[11px] font-semibold">
                +0.3 vs mes ant.
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 dark:text-slate-400">
            Basado en <strong>{totalFeedbacks}</strong> opiniones internas
          </CardContent>
        </Card>

        {/* KPI 2: Experiencias Positivas */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Satisfacción Neta
            </CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {positivePercent}%
              </CardTitle>
              <Badge variant="outline" className="text-[11px]">
                {positiveCount} Positivas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{neutralCount} Neutrales</span>
            <span className="text-red-500 font-medium">{negativeCount} Críticas (1-2★)</span>
          </CardContent>
        </Card>

        {/* KPI 3: Casos / SLAs */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Incidentes & Recuperación
            </CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {openCases.length}
              </CardTitle>
              <Badge variant={openCases.length > 0 ? "warning" : "success"} className="text-[11px]">
                {openCases.length > 0 ? "Casos Activos" : "Al día"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{resolvedCases.length} Casos resueltos</span>
            <Link href="/dashboard/cases" className="text-primary font-semibold hover:underline">
              Ver incidentes →
            </Link>
          </CardContent>
        </Card>

        {/* KPI 4: Google Reviews Routing Funnel */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Conversión a Google
            </CardDescription>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {googleCTR}%
              </CardTitle>
              <Badge variant="success" className="text-[11px]">
                CTR Invitaciones
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{googleOffered} ofrecidas</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{googleClicked} clics registrados</span>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas: Evolución Temporal y Distribución de Estrellas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica 1: Evolución de Satisfacción */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Evolución del Rating Diario
                </CardTitle>
                <CardDescription className="text-xs">
                  Tendencia de satisfacción en los últimos 14 días.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-medium">
                Últimos 14 días
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis domain={[3.5, 5]} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                    formatter={(val: any) => [`${val}★`, "Rating Promedio"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="promedio"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#ratingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica 2: Distribución de 1 a 5 Estrellas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Distribución de Estrellas
            </CardTitle>
            <CardDescription className="text-xs">
              Desglose de calificaciones recibidas en el punto físico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {starDistribution.map((item) => {
                const percent = totalFeedbacks > 0 ? Math.round((item.count / totalFeedbacks) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        {item.name}
                      </span>
                      <span className="text-slate-500">
                        {item.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link href="/dashboard/feed" className="text-xs font-semibold text-primary hover:underline">
                Explorar inbox de opiniones ({totalFeedbacks}) →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secciones Inferiores: Top Colaboradores & Casos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Colaboradores (Medición ética interna) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Desempeño de Colaboradores
                </CardTitle>
                <CardDescription className="text-xs">
                  Medición basada 100% en opiniones internas directas en sala/mostrador.
                </CardDescription>
              </div>
              <Link href="/dashboard/employees">
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {employees.slice(0, 4).map((emp) => {
              const branch = branches.find(b => b.id === emp.branchId);
              return (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold flex items-center justify-center text-xs">
                      {emp.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">{emp.displayName}</p>
                      <p className="text-[11px] text-slate-400">{emp.position} • {branch?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white text-sm">
                      <span>{emp.metricsSummary.averageRating}</span>
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    </div>
                    <span className="text-[10px] text-slate-400">{emp.metricsSummary.totalFeedbacks} opiniones</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Incidentes Recientes y Casos Urgentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Casos de Recuperación Críticos
                </CardTitle>
                <CardDescription className="text-xs">
                  Experiencias de 1-2★ que requieren contacto y compensación.
                </CardDescription>
              </div>
              <Link href="/dashboard/cases">
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver incidentes
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {cases.slice(0, 3).map((c) => {
              const branch = branches.find(b => b.id === c.branchId);
              return (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      <span>{c.severity === "critical" ? "Severidad Crítica" : "Severidad Alta"}</span>
                    </span>
                    <Badge variant={c.status === "resolved" ? "success" : "warning"} className="text-[10px]">
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                    {c.internalNotes}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{branch?.name}</span>
                    <span>{c.customerContact ? `Contacto: ${c.customerContact}` : "Anónimo"}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
