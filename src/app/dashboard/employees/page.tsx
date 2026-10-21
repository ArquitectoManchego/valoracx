"use client";

import React, { useState, useMemo } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Employee } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Users, Star, Plus, MapPin, Award, TrendingUp, 
  MessageSquare, UserCheck, Shield, ChevronRight, BarChart2 
} from "lucide-react";

export default function EmployeesPage() {
  const { selectedBranchId, branches, currentRole, activeEmployeeId } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("Mesero");
  const [branchId, setBranchId] = useState("");
  const [shift, setShift] = useState<Employee["shift"]>("morning");

  const employees = useMemo(() => {
    let list = DataStore.getEmployees(selectedBranchId === "all" ? undefined : selectedBranchId);
    // Si el rol es empleado, restringir a su propia ficha
    if (currentRole === "employee" && activeEmployeeId) {
      list = list.filter(e => e.id === activeEmployeeId);
    }
    return list.sort((a, b) => b.metricsSummary.averageRating - a.metricsSummary.averageRating);
  }, [selectedBranchId, currentRole, activeEmployeeId]);

  // Feedbacks del empleado seleccionado o activo
  const activeEmp = selectedEmployee || employees[0] || null;

  const employeeFeedbacks = useMemo(() => {
    if (!activeEmp) return [];
    return DataStore.getFeedbacks({ employeeId: activeEmp.id });
  }, [activeEmp]);

  // Comparativa contra promedio de la sucursal
  const branchAverage = useMemo(() => {
    if (!activeEmp) return 4.5;
    const branchFeedbacks = DataStore.getFeedbacks({ branchId: activeEmp.branchId });
    if (branchFeedbacks.length === 0) return 4.5;
    const sum = branchFeedbacks.reduce((acc, f) => acc + f.rating, 0);
    return Number((sum / branchFeedbacks.length).toFixed(1));
  }, [activeEmp]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !branchId) return;

    const newEmp = DataStore.addEmployee({
      tenantId: "ten_imperia_uniformes",
      branchId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      displayName: `${firstName.trim()} ${lastName.trim().charAt(0)}.`,
      position,
      shift,
      isActive: true,
    });

    setIsCreating(false);
    setFirstName("");
    setLastName("");
    setSelectedEmployee(newEmp);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {currentRole === "employee" ? "Mi Desempeño Individual" : "Colaboradores & Medición Ética"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Métricas de servicio basadas 100% en opiniones directas de clientes en sala. Sin presiones tóxicas de cuotas públicas.
          </p>
        </div>

        {currentRole !== "employee" && (
          <Button onClick={() => { setIsCreating(true); if (branches.length > 0) setBranchId(branches[0].id); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Registrar Colaborador</span>
          </Button>
        )}
      </div>

      {/* Formulario de Alta */}
      {isCreating && (
        <Card className="border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Registrar Nuevo Colaborador</CardTitle>
            <CardDescription>Crea la ficha y asigna su turno para generar su tarjeta NFC.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Carlos"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Apellidos</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Ramírez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Cargo / Puesto</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Mesero, Barista, Hostess"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Sucursal</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Guardar y Activar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Layout Split: Ranking / Lista a la izquierda y Detalle a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Ranking de Colaboradores */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Ranking Interno</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Ordenado por satisfacción de clientes atendidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {employees.map((emp, idx) => {
              const isSelected = activeEmp?.id === emp.id;
              const branch = branches.find(b => b.id === emp.branchId);

              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-950/40 dark:border-emerald-500/40 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-4 text-center ${
                      idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-400" : "text-slate-500"
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs">
                      {emp.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-semibold text-xs ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        {emp.displayName}
                      </p>
                      <p className="text-[11px] opacity-70">
                        {emp.position} • {branch?.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-xs">
                      <span>{emp.metricsSummary.averageRating}</span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    </div>
                    <span className="text-[10px] opacity-70">{emp.metricsSummary.totalFeedbacks} op.</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Columna 2 & 3: Ficha Detallada del Colaborador */}
        {activeEmp && (
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-extrabold text-xl flex items-center justify-center shadow-md">
                      {activeEmp.firstName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        {activeEmp.displayName} ({activeEmp.firstName} {activeEmp.lastName})
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {activeEmp.position} • {branches.find(b => b.id === activeEmp.branchId)?.name}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Badge de Comparativa con Sucursal */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Comparativa vs Sucursal
                    </span>
                    <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {activeEmp.metricsSummary.averageRating}★
                      </span>
                      <span className="text-xs text-slate-400">
                        (Promedio sucursal: {branchAverage}★)
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 4 Métricas de Ficha */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Encuestas</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {activeEmp.metricsSummary.totalFeedbacks}
                    </p>
                  </div>
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-center">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">Positivas</span>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {activeEmp.metricsSummary.positiveCount}
                    </p>
                  </div>
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40 text-center">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold">Neutrales</span>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {activeEmp.metricsSummary.neutralCount}
                    </p>
                  </div>
                  <div className="bg-red-50/60 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/40 text-center">
                    <span className="text-[10px] text-red-700 dark:text-red-400 uppercase font-semibold">Críticas</span>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {activeEmp.metricsSummary.negativeCount}
                    </p>
                  </div>
                </div>

                {/* Comentarios Directos sobre este Colaborador */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span>Últimas opiniones de clientes atendidos por {activeEmp.displayName}</span>
                  </h4>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {employeeFeedbacks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No hay comentarios aún para este colaborador.</p>
                    ) : (
                      employeeFeedbacks.slice(0, 6).map((f) => (
                        <div
                          key={f.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                              <span>{f.rating}</span>
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            </div>
                            <span className="text-[10px] text-slate-400">{new Date(f.createdAt).toLocaleDateString("es-MX")}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-200">
                            {f.comment || <span className="italic text-slate-400">Calificación sin comentario</span>}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
