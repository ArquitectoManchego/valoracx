"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { timeAgo, formatDate } from "@/lib/utils";
import { 
  Star, MessageSquare, AlertCircle, CheckCircle2, 
  ExternalLink, Sparkles, Filter, User, MapPin, Tag, ThumbsUp, ThumbsDown
} from "lucide-react";

export default function FeedbackFeedPage() {
  const { selectedBranchId, branches, employees } = useAuth();
  const [filterType, setFilterType] = useState<"all" | "negative" | "positive" | "neutral" | "with_comment">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allFeedbacks = useMemo(() => {
    return DataStore.getFeedbacks(
      selectedBranchId === "all" ? undefined : { branchId: selectedBranchId }
    );
  }, [selectedBranchId]);

  const filteredFeedbacks = useMemo(() => {
    return allFeedbacks.filter(f => {
      if (filterType === "negative" && f.rating > 2) return false;
      if (filterType === "positive" && f.rating < 4) return false;
      if (filterType === "neutral" && f.rating !== 3) return false;
      if (filterType === "with_comment" && !f.comment) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const hasComment = f.comment?.toLowerCase().includes(query);
        const hasIssue = f.aiAnalysis.detectedIssues.some(i => i.toLowerCase().includes(query));
        if (!hasComment && !hasIssue) return false;
      }
      return true;
    });
  }, [allFeedbacks, filterType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Feed de Opiniones (Inbox en Tiempo Real)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Todas las encuestas respondidas en sucursales físicas con análisis semántico de IA y estado de enrutamiento a Google.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold py-1 px-3">
            {filteredFeedbacks.length} opiniones filtradas
          </Badge>
        </div>
      </div>

      {/* Quick Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setFilterType("all")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
            filterType === "all"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          Todo ({allFeedbacks.length})
        </button>

        <button
          onClick={() => setFilterType("negative")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
            filterType === "negative"
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          <AlertCircle className="h-3 w-3" />
          <span>Críticos 1-2★ ({allFeedbacks.filter(f => f.rating <= 2).length})</span>
        </button>

        <button
          onClick={() => setFilterType("positive")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
            filterType === "positive"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
          }`}
        >
          <ThumbsUp className="h-3 w-3" />
          <span>Positivos 4-5★ ({allFeedbacks.filter(f => f.rating >= 4).length})</span>
        </button>

        <button
          onClick={() => setFilterType("neutral")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
            filterType === "neutral"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          Neutral 3★ ({allFeedbacks.filter(f => f.rating === 3).length})
        </button>

        <button
          onClick={() => setFilterType("with_comment")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
            filterType === "with_comment"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          Con comentario ({allFeedbacks.filter(f => f.comment).length})
        </button>

        {/* Búsqueda textual */}
        <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0">
          <input
            type="text"
            placeholder="Buscar por comentario o falla..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
          />
        </div>
      </div>

      {/* Lista de Feedbacks */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No hay opiniones que coincidan con los filtros seleccionados.
            </p>
          </div>
        ) : (
          filteredFeedbacks.map((f) => {
            const branch = branches.find(b => b.id === f.branchId);
            const employee = employees.find(e => e.id === f.employeeId);

            return (
              <Card key={f.id} className="hover:shadow-sm transition-all border-slate-200/90 dark:border-slate-800">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Calificación y Comentario */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {/* Rating Stars Badge */}
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs ${
                          f.rating >= 4
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : f.rating === 3
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}>
                          <span>{f.rating}</span>
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </div>

                        {/* AI Sentiment Badge */}
                        <Badge variant={
                          f.aiAnalysis.sentiment === "POSITIVE" ? "success" :
                          f.aiAnalysis.sentiment === "NEGATIVE" ? "destructive" : "warning"
                        } className="text-[10px]">
                          IA: {f.aiAnalysis.sentiment} ({f.aiAnalysis.positiveScore} pts)
                        </Badge>

                        {/* Enrutamiento Google Badge */}
                        {f.googleReviewRouting.offered ? (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:text-emerald-400 flex items-center gap-1">
                            <ExternalLink className="h-2.5 w-2.5" />
                            <span>Invitación Google Ofrecida</span>
                            {f.googleReviewRouting.clickedAt && <span className="font-bold">(Clic)</span>}
                          </Badge>
                        ) : f.rating <= 2 ? (
                          <Badge variant="outline" className="text-[10px] text-red-600 border-red-300 dark:text-red-400">
                            Interno Retenido (1-2★)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-slate-500">
                            Interno
                          </Badge>
                        )}
                      </div>

                      {/* Comentario del Cliente */}
                      {f.comment ? (
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                          "{f.comment}"
                        </p>
                      ) : (
                        <p className="text-xs italic text-slate-400">
                          (Sin comentario de texto libre)
                        </p>
                      )}

                      {/* Categorías evaluadas */}
                      {f.categoriesSelected.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {f.categoriesSelected.map(cat => (
                            <span
                              key={cat}
                              className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                            >
                              #{cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metadatos y Vínculos Operativos */}
                    <div className="text-left sm:text-right shrink-0 space-y-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <div className="flex items-center sm:justify-end gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{branch?.name || "Sucursal"}</span>
                      </div>

                      {employee && (
                        <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>Atendió: <strong>{employee.displayName}</strong></span>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400">{timeAgo(f.createdAt)}</p>

                      {/* Botón de Caso si aplica */}
                      {f.caseId && (
                        <div className="pt-2">
                          <Link href={`/dashboard/cases`}>
                            <Button size="sm" variant="destructive" className="h-7 text-xs px-2.5">
                              <span>Ver Incidente #{f.caseId.slice(-3)}</span>
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
