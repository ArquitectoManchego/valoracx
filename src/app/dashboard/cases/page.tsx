"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Case, CaseStatus, Compensation } from "@/types";
import { CASE_STATUS_CONFIG } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  AlertCircle, Clock, CheckCircle2, User, Phone, 
  TicketCheck, ArrowRight, MessageSquare, Send, ShieldAlert, MapPin 
} from "lucide-react";

export default function CasesPage() {
  const { selectedBranchId, branches, employees } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Compensation Modal State
  const [isCompensationModalOpen, setIsCompensationModalOpen] = useState(false);
  const [compType, setCompType] = useState<Compensation["type"]>("free_item");
  const [compDescription, setCompDescription] = useState("");
  const [internalNotesInput, setInternalNotesInput] = useState("");

  const loadData = () => {
    const list = DataStore.getCases(selectedBranchId === "all" ? undefined : selectedBranchId);
    setCases([...list]);
    if (list.length > 0 && !selectedCase) {
      setSelectedCase(list[0]);
      setInternalNotesInput(list[0].internalNotes);
    }
  };

  useMemo(() => {
    loadData();
  }, [selectedBranchId]);

  const filteredCases = useMemo(() => {
    if (statusFilter === "all") return cases;
    return cases.filter(c => c.status === statusFilter);
  }, [cases, statusFilter]);

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (!selectedCase) return;
    const updated = DataStore.updateCaseStatus(selectedCase.id, newStatus, internalNotesInput);
    if (updated) {
      setSelectedCase({ ...updated });
      loadData();
    }
  };

  const handleSaveNotes = () => {
    if (!selectedCase) return;
    const updated = DataStore.updateCaseStatus(selectedCase.id, selectedCase.status, internalNotesInput);
    if (updated) {
      setSelectedCase({ ...updated });
      loadData();
      alert("Notas internas guardadas correctamente.");
    }
  };

  const handleIssueCompensation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !compDescription.trim()) return;

    const comp = DataStore.issueCompensation({
      caseId: selectedCase.id,
      type: compType,
      valueDescription: compDescription.trim(),
    });

    setIsCompensationModalOpen(false);
    setCompDescription("");
    loadData();
    const updated = DataStore.getCaseById(selectedCase.id);
    if (updated) setSelectedCase({ ...updated });
    alert(`Compensación generada exitosamente con código: ${comp.code}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <span>Gestión de Incidentes (SLA & Recuperación)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Casos creados automáticamente ante experiencias negativas (1-2★). Asignación, contacto y compensación.
          </p>
        </div>

        <Link href="/dashboard/compensations">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <TicketCheck className="h-4 w-4 text-emerald-500" />
            <span>Bandeja de Compensaciones</span>
          </Button>
        </Link>
      </div>

      {/* Filtros Rápidos de Estado */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        {["all", "new", "reviewing", "contacted", "compensation_sent", "resolved"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition capitalize ${
              statusFilter === st
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {st === "all" ? `Todos (${cases.length})` : CASE_STATUS_CONFIG[st as CaseStatus]?.label || st}
          </button>
        ))}
      </div>

      {/* Split Layout: Bandeja de Casos a la izquierda y Detalle a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Lista de Incidentes */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Bandeja de Casos ({filteredCases.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 max-h-[700px] overflow-y-auto">
            {filteredCases.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No hay casos en este estado.</p>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                const branch = branches.find(b => b.id === c.branchId);
                const employee = employees.find(e => e.id === c.employeeId);
                const statusCfg = CASE_STATUS_CONFIG[c.status];

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setInternalNotesInput(c.internalNotes);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all space-y-2 ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-800 dark:border-slate-700 shadow-md"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        c.severity === "critical" ? "text-red-400" : "text-amber-400"
                      }`}>
                        #{c.id.slice(-4)} • {c.severity.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg?.badgeClass || ""}`}>
                        {statusCfg?.label}
                      </span>
                    </div>

                    <p className={`text-xs font-medium line-clamp-2 ${isSelected ? "text-slate-100" : "text-slate-800 dark:text-slate-200"}`}>
                      {c.internalNotes}
                    </p>

                    <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                      <span>{branch?.name}</span>
                      <span>{c.customerName || "Cliente Anónimo"}</span>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Columna Derecha: Detalle, SLA, Asignación y Compensación */}
        {selectedCase ? (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      Caso #{selectedCase.id}
                    </CardTitle>
                    <Badge variant={selectedCase.severity === "critical" ? "destructive" : "warning"}>
                      Severidad {selectedCase.severity}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Creado el {new Date(selectedCase.createdAt).toLocaleString("es-MX")}
                  </CardDescription>
                </div>

                {/* Ciclo de Estados */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["new", "reviewing", "contacted", "compensation_sent", "resolved"] as CaseStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        selectedCase.status === st
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {CASE_STATUS_CONFIG[st]?.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-5">
              {/* Información de Contacto del Cliente y Consentimiento */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Datos de Contacto para Recuperación
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedCase.customerName || "Nombre no proporcionado"}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{selectedCase.customerContact || "Sin número de teléfono"}</span>
                    </p>
                  </div>

                  <Badge variant={selectedCase.customerConsent ? "success" : "secondary"} className="text-xs">
                    {selectedCase.customerConsent ? "Consentimiento Otorgado" : "Sin Consentimiento"}
                  </Badge>
                </div>
              </div>

              {/* Botón de Emitir Compensación */}
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <TicketCheck className="h-4 w-4 text-purple-600" />
                    <span>Compensación de Cortesía</span>
                  </h4>
                  <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">
                    {selectedCase.compensationId 
                      ? `Compensación #${selectedCase.compensationId} ya fue emitida y vinculada a este caso.` 
                      : "Genera un cupón de recuperación único para enviar al cliente por WhatsApp o Email."}
                  </p>
                </div>

                {!selectedCase.compensationId && (
                  <Button
                    size="sm"
                    onClick={() => setIsCompensationModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs shrink-0"
                  >
                    Emitir Compensación
                  </Button>
                )}
              </div>

              {/* Notas Internas y Plan de Acción */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Notas Internas del Incidente & Acción Correctiva
                  </label>
                  <Button size="sm" variant="outline" onClick={handleSaveNotes} className="text-xs h-7">
                    Guardar Notas
                  </Button>
                </div>
                <textarea
                  rows={4}
                  value={internalNotesInput}
                  onChange={(e) => setInternalNotesInput(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-200 resize-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center p-12 text-slate-400 text-sm">
            Selecciona un incidente para gestionar.
          </div>
        )}
      </div>

      {/* Modal Emitir Compensación */}
      {isCompensationModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Emitir Compensación para Caso #{selectedCase.id}
            </h3>
            <p className="text-xs text-slate-500">
              Crea un código de cortesía canjeable en el punto físico para resarcir la experiencia.
            </p>

            <form onSubmit={handleIssueCompensation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Tipo de Beneficio</label>
                <select
                  value={compType}
                  onChange={(e) => setCompType(e.target.value as Compensation["type"])}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                >
                  <option value="free_item">Producto / Platillo de Cortesía</option>
                  <option value="discount_percent">Porcentaje de Descuento</option>
                  <option value="credit_amount">Monto de Crédito en Cuenta</option>
                  <option value="coupon">Cupón General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Descripción del Beneficio</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Postre de la casa y 2 bebidas de cortesía en próxima visita"
                  value={compDescription}
                  onChange={(e) => setCompDescription(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCompensationModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Generar y Enviar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
