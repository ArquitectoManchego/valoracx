"use client";

import React, { useState, useMemo } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Branch } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Store, Star, Plus, MapPin, Users, AlertCircle, 
  ExternalLink, BarChart3, TrendingUp, Phone, CheckCircle2 
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function BranchesPage() {
  const { branches, employees, refreshData } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [city, setCity] = useState("Veracruz");
  const [phone, setPhone] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");

  // Branch statistics calculation
  const branchStats = useMemo(() => {
    return branches.map((b) => {
      const bFeedbacks = DataStore.getFeedbacks({ branchId: b.id });
      const bCases = DataStore.getCases(b.id);
      const bEmployees = employees.filter(e => e.branchId === b.id);
      const total = bFeedbacks.length;
      const avg = total > 0 
        ? Number((bFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1))
        : 5.0;

      const positiveCount = bFeedbacks.filter(f => f.rating >= 4).length;
      const negativeCount = bFeedbacks.filter(f => f.rating <= 2).length;
      const satisfactionRate = total > 0 ? Math.round((positiveCount / total) * 100) : 100;

      const monthlyCounter = DataStore.getMonthlyCounter("ten_restaurante_demo", b.id);

      return {
        ...b,
        internalRating: avg,
        totalFeedbacks: total,
        employeesCount: bEmployees.length,
        openCasesCount: bCases.filter(c => c.status !== "resolved" && c.status !== "closed").length,
        satisfactionRate,
        positive34Routed: monthlyCounter.positive34Routed,
      };
    });
  }, [branches, employees]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    DataStore.addBranch({
      tenantId: "ten_restaurante_demo",
      name: name.trim(),
      code: code.trim(),
      address: {
        street: "Calle Principal",
        city,
        state: "Veracruz",
        postalCode: "91000",
        country: "México",
      },
      phone: phone || "+52 229 000 0000",
      timezone: "America/Mexico_City",
      operatingHours: {},
      googleBusiness: {
        reviewUrl: reviewUrl.trim() || "https://search.google.com/local/writereview",
        currentRating: 4.5,
        totalReviews: 50,
      },
      areas: ["Salón", "Terraza"],
      isActive: true,
    });

    setIsCreating(false);
    setName("");
    setCode("");
    setPhone("");
    setReviewUrl("");
    refreshData();
  };

  const comparisonChartData = useMemo(() => {
    return branchStats.map(b => ({
      name: b.name.replace("Sucursal ", ""),
      "Rating Interno": b.internalRating,
      "Google Rating": b.googleBusiness.currentRating || 4.5,
      "Satisfacción %": b.satisfactionRate,
    }));
  }, [branchStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sucursales & Comparativa Multi-Punto
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de satisfacción, Google Rating y cuotas mensuales de reputación por ubicación física.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCompareMode(!compareMode)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{compareMode ? "Ver Tarjetas" : "Comparativa A vs B vs C"}</span>
          </Button>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Sucursal</span>
          </Button>
        </div>
      </div>

      {/* Formulario de Alta */}
      {isCreating && (
        <Card className="border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Agregar Nueva Sucursal</CardTitle>
            <CardDescription>Configura la ubicación y el enlace oficial de Google Reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nombre de Sucursal</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Sucursal Costa de Oro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Código Identificador</label>
                <input
                  type="text"
                  required
                  placeholder="ej: CSD-04"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="ej: +52 229 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Google Review URL</label>
                <input
                  type="text"
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={reviewUrl}
                  onChange={(e) => setReviewUrl(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>

              <div className="md:col-span-4 flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Crear Sucursal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modo Comparativa A vs B vs C */}
      {compareMode && (
        <Card className="border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Comparativa de Desempeño: Sucursal Centro vs Andamar vs Norte
            </CardTitle>
            <CardDescription className="text-xs">
              Contraste entre satisfacción interna, rating público en Google Maps y volumen de respuestas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="Rating Interno" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Google Rating" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de Sucursales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branchStats.map((branch) => (
          <Card key={branch.id} className="relative overflow-hidden hover:shadow-md transition">
            <div className="h-2 w-full bg-emerald-500" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    {branch.name}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{branch.address.street}, {branch.address.city}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {branch.code}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              {/* Bloque de Ratings (Interno vs Google) */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Satisfacción Interna</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5 font-extrabold text-base text-slate-900 dark:text-white">
                    <span>{branch.internalRating}</span>
                    <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                  </div>
                  <span className="text-[10px] text-slate-500">{branch.totalFeedbacks} opiniones</span>
                </div>

                <div className="border-l border-slate-200 dark:border-slate-700 pl-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Google Maps</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5 font-extrabold text-base text-slate-900 dark:text-white">
                    <span>{branch.googleBusiness.currentRating}</span>
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-500">{branch.googleBusiness.totalReviews} reseñas públicas</span>
                </div>
              </div>

              {/* Cuota Mensual 3-4★ */}
              <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">Cuota 3-4★ Mes Actual:</span>
                  <p className="text-[10px] text-slate-500">Límite compartido por sucursal</p>
                </div>
                <Badge variant={branch.positive34Routed >= 2 ? "warning" : "success"} className="text-xs">
                  {branch.positive34Routed} / 2 Usado
                </Badge>
              </div>

              {/* Metadatos Rápidos */}
              <div className="flex items-center justify-between text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{branch.employeesCount} colaboradores</span>
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className={`h-3.5 w-3.5 ${branch.openCasesCount > 0 ? "text-amber-500" : "text-slate-400"}`} />
                  <span>{branch.openCasesCount} incidentes activos</span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
