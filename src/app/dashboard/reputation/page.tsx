"use client";

import React, { useState, useMemo } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Star, ExternalLink, Calculator, TrendingUp, 
  CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, RefreshCw 
} from "lucide-react";

export default function ReputationPage() {
  const { branches, tenant } = useAuth();

  const allFeedbacks = useMemo(() => DataStore.getFeedbacks(), []);

  // Métricas del Funnel
  const totalSurveys = allFeedbacks.length;
  const eligibleFeedbacks = allFeedbacks.filter(f => 
    f.rating === 5 || (f.rating >= 3 && f.aiAnalysis.sentiment === "POSITIVE" && f.aiAnalysis.positiveScore >= 75)
  ).length;

  const googleOffered = allFeedbacks.filter(f => f.googleReviewRouting.offered).length;
  const googleClicked = allFeedbacks.filter(f => f.googleReviewRouting.clickedAt).length;
  const ctr = googleOffered > 0 ? ((googleClicked / googleOffered) * 100).toFixed(1) : "0.0";

  // Desglose por estrellas
  const offered5Stars = allFeedbacks.filter(f => f.googleReviewRouting.offered && f.rating === 5).length;
  const offered4Stars = allFeedbacks.filter(f => f.googleReviewRouting.offered && f.rating === 4).length;
  const offered3Stars = allFeedbacks.filter(f => f.googleReviewRouting.offered && f.rating === 3).length;

  // Calculadora de Reputación Matemática
  const [calcCurrentRating, setCalcCurrentRating] = useState<number>(4.2);
  const [calcTotalReviews, setCalcTotalReviews] = useState<number>(248);
  const [calcTargetRating, setCalcTargetRating] = useState<number>(4.7);

  const needed5Stars = useMemo(() => {
    if (calcTargetRating >= 5) return "Inalcanzable (límite matemático 5.0)";
    if (calcTargetRating <= calcCurrentRating) return 0;

    // Formula: (CurrentReviews * (Target - CurrentRating)) / (5 - Target)
    const numerator = calcTotalReviews * (calcTargetRating - calcCurrentRating);
    const denominator = 5 - calcTargetRating;
    const result = Math.ceil(numerator / denominator);
    return result > 0 ? result : 0;
  }, [calcCurrentRating, calcTotalReviews, calcTargetRating]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            <span>Reputación Online & Google Reviews Routing</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitoreo ético de invitaciones a Google Reviews, cuotas mensuales de 3-4★ y calculadora matemática.
          </p>
        </div>

        <Badge variant="outline" className="text-xs font-semibold py-1 px-3">
          Cuota Máxima 3-4★: 2 / mes / sucursal
        </Badge>
      </div>

      {/* GOOGLE REVIEW FUNNEL */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Funnel de Enrutamiento a Google Reviews
              </CardTitle>
              <CardDescription className="text-xs">
                Conversión desde la encuesta interna física hasta el clic en la reseña de Google.
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Tasa de Clics (CTR)</span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{ctr}%</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">1. Encuestas Internas</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalSurveys}</p>
              <p className="text-[10px] text-slate-500">100% registradas en sistema</p>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold">2. Feedback Elegible</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{eligibleFeedbacks}</p>
              <p className="text-[10px] text-slate-500">5★ o (3-4★ score ≥ 75)</p>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold">3. Invitación Ofrecida</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{googleOffered}</p>
              <p className="text-[10px] text-slate-500">Filtrado por cuota mensual</p>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold">4. Clics hacia Google</span>
              <p className="text-2xl font-extrabold text-primary">{googleClicked}</p>
              <p className="text-[10px] text-slate-500">Evento google_review_link_clicked</p>
            </div>
          </div>

          {/* Desglose de Invitaciones y Cuotas por Sucursal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            {/* Desglose de invitaciones */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Desglose de Invitaciones Mostradas
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">5 estrellas (Sin límite mensual)</span>
                  <Badge variant="outline">{offered5Stars} ofrecidas</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">4 estrellas positivas (Bajo cuota mensual)</span>
                  <Badge variant="outline">{offered4Stars} ofrecidas este mes</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">3 estrellas positivas (Bajo cuota mensual)</span>
                  <Badge variant="outline">{offered3Stars} ofrecidas este mes</Badge>
                </div>
              </div>
            </div>

            {/* Cuotas 3-4★ por Sucursal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Cuota 3-4★ por Sucursal (Mes Actual)
                </h4>
                <span className="text-[10px] text-slate-400">Reinicio: 1 de Noviembre</span>
              </div>

              <div className="space-y-2 text-xs">
                {branches.map((b) => {
                  const counter = DataStore.getMonthlyCounter("ten_restaurante_demo", b.id);
                  const isFull = counter.positive34Routed >= 2;

                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{b.name}</span>
                      <Badge variant={isFull ? "warning" : "success"} className="text-xs">
                        {counter.positive34Routed} / 2 {isFull ? "(Límite alcanzado)" : "Utilizado"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CALCULADORA DE REPUTACIÓN MATEMÁTICA */}
      <Card className="border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-500" />
            <span>Calculadora Matemática de Reputación</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Calcula exactamente cuántas nuevas calificaciones perfectas (5★) se necesitan matemáticamente para elevar tu rating público en Google Maps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Rating Actual de Google</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={calcCurrentRating}
                onChange={(e) => setCalcCurrentRating(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Número Actual de Reseñas</label>
              <input
                type="number"
                min="1"
                value={calcTotalReviews}
                onChange={(e) => setCalcTotalReviews(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Rating Objetivo</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="4.9"
                value={calcTargetRating}
                onChange={(e) => setCalcTargetRating(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 font-bold"
              />
            </div>
          </div>

          {/* Resultado de la estimación */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Reseñas de 5★ Necesarias Matemáticamente
              </span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {typeof needed5Stars === "number" ? `+${needed5Stars} reseñas de 5★` : needed5Stars}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Para pasar de {calcCurrentRating}★ a {calcTargetRating}★ con {calcTotalReviews} reseñas base.
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-500 max-w-xs leading-relaxed italic">
              "Estimación matemática basada en promedios ponderados, no garantía de resultados."
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
