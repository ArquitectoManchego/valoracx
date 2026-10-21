"use client";

import React, { useMemo } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  BarChart3, Download, FileText, Printer, 
  Sparkles, Star, CheckCircle2, TrendingUp, Users 
} from "lucide-react";

export default function ReportsPage() {
  const { tenant, selectedBranchId, branches } = useAuth();
  const feedbacks = useMemo(() => DataStore.getFeedbacks(), []);
  const cases = useMemo(() => DataStore.getCases(), []);

  const totalFeedbacks = feedbacks.length;
  const avgRating = totalFeedbacks > 0 
    ? (feedbacks.reduce((a, b) => a + b.rating, 0) / totalFeedbacks).toFixed(2)
    : "5.0";

  const exportCSV = () => {
    let csv = "ID,Fecha,Sucursal,Rating,Sentimiento,PositiveScore,Comentario\n";
    feedbacks.forEach(f => {
      const b = branches.find(br => br.id === f.branchId)?.name || "Sucursal";
      const cleanComment = (f.comment || "").replace(/"/g, '""');
      csv += `"${f.id}","${f.createdAt}","${b}",${f.rating},"${f.aiAnalysis.sentiment}",${f.aiAnalysis.positiveScore},"${cleanComment}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Reporte_ValoraCX_${tenant.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>Reportes Ejecutivos & Exportación</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Descarga de datos analíticos, trazabilidad y resúmenes ejecutivos generados por IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm" className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" />
            <span>Imprimir / PDF</span>
          </Button>

          <Button onClick={exportCSV} size="sm" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="h-4 w-4" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* Resumen Ejecutivo IA para Dirección */}
      <Card className="border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>Resumen Ejecutivo Generado por Gemini AI</span>
            </CardTitle>
            <Badge variant="success">Octubre 2026</Badge>
          </div>
          <CardDescription className="text-xs">
            Informe sintético consolidado de satisfacción para directores y propietarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Durante el período analizado se registraron <strong>{totalFeedbacks} encuestas</strong> a través de tarjetas NFC y códigos QR físicos. El índice global de satisfacción promedio se ubicó en <strong>{avgRating}★</strong>, con un <strong>85% de menciones netamente favorables</strong>.
          </p>
          <p>
            <strong>Puntos Fuertes:</strong> La atención al cliente fue la categoría más valorada (mencionada positivamente en 92 encuestas), destacando el desempeño de los colaboradores <strong>Ana P.</strong> y <strong>Sofía G.</strong> en la Sucursal Andamar.
          </p>
          <p>
            <strong>Áreas de Oportunidad & Casos:</strong> Se registraron <strong>{cases.length} incidentes</strong> con calificación ≤ 2★, de los cuales el <strong>85% ya fueron resueltos</strong> con envío de compensación y protocolo de recuperación en menos de 2 horas.
          </p>
        </CardContent>
      </Card>

      {/* Tabla Resumen de Sucursales para Reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Resumen Consolidado por Sucursal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Sucursal</th>
                <th className="p-3">Total Opiniones</th>
                <th className="p-3">Rating Promedio</th>
                <th className="p-3">Incidentes</th>
                <th className="p-3">Cuota Google 3-4★</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {branches.map((b) => {
                const bFeedbacks = feedbacks.filter(f => f.branchId === b.id);
                const bCases = cases.filter(c => c.branchId === b.id);
                const avg = bFeedbacks.length > 0
                  ? (bFeedbacks.reduce((acc, f) => acc + f.rating, 0) / bFeedbacks.length).toFixed(1)
                  : "5.0";
                const counter = DataStore.getMonthlyCounter(b.tenantId || "ten_imperia_uniformes", b.id);

                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{b.name}</td>
                    <td className="p-3">{bFeedbacks.length}</td>
                    <td className="p-3 font-bold text-emerald-600">{avg}★</td>
                    <td className="p-3">{bCases.length} casos</td>
                    <td className="p-3">{counter.positive34Routed} / 2 usado</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
