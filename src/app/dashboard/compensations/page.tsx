"use client";

import React, { useState, useEffect } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Compensation } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  TicketCheck, CheckCircle2, Clock, AlertTriangle, 
  Search, Gift, ShieldCheck, QrCode 
} from "lucide-react";

export default function CompensationsPage() {
  const { selectedBranchId, branches } = useAuth();
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [redemptionCodeInput, setRedemptionCodeInput] = useState("");
  const [redemptionMessage, setRedemptionMessage] = useState<{ success: boolean; text: string } | null>(null);

  const loadData = () => {
    setCompensations([...DataStore.getCompensations()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidateRedemption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redemptionCodeInput.trim()) return;

    const targetBranch = selectedBranchId === "all" ? branches[0]?.id || "br_centro" : selectedBranchId;
    const success = DataStore.redeemCompensation(redemptionCodeInput.trim(), targetBranch);

    if (success) {
      setRedemptionMessage({
        success: true,
        text: `¡Código ${redemptionCodeInput.trim()} canjeado exitosamente en ${branches.find(b => b.id === targetBranch)?.name}!`,
      });
      setRedemptionCodeInput("");
      loadData();
    } else {
      setRedemptionMessage({
        success: false,
        text: `Código ${redemptionCodeInput.trim()} no encontrado, expirado o ya canjeado previamente.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TicketCheck className="h-6 w-6 text-purple-600" />
            <span>Compensaciones & Códigos de Recuperación</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Trazabilidad de cortesías y cupones emitidos para clientes con incidentes. Validación en mostrador/caja.
          </p>
        </div>
      </div>

      {/* Caja de Canje en Punto de Venta (Simulador de Cajero) */}
      <Card className="border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/10">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="h-4 w-4 text-purple-600" />
            <span>Terminal de Canje en Sucursal (Caja / Mostrador)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Ingresa o escanea el código presentado por el cliente para validar y quemar el cupón.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleValidateRedemption} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="ej: REC-1002-VAL o VAL-5821-CUP"
              value={redemptionCodeInput}
              onChange={(e) => setRedemptionCodeInput(e.target.value.toUpperCase())}
              className="flex-1 text-sm font-mono uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3"
            />
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6">
              Verificar & Canjear
            </Button>
          </form>

          {redemptionMessage && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              redemptionMessage.success
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {redemptionMessage.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
              <span>{redemptionMessage.text}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Listado de Compensaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Historial de Compensaciones Emitidas ({compensations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Beneficio</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Caso Vinculado</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Fecha Emisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {compensations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      {c.code}
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-200 max-w-xs truncate">
                      {c.valueDescription}
                    </td>
                    <td className="p-3 capitalize text-slate-500">
                      {c.type.replace("_", " ")}
                    </td>
                    <td className="p-3 font-mono text-purple-600 dark:text-purple-400">
                      {c.caseId ? `#${c.caseId.slice(-4)}` : "Directo"}
                    </td>
                    <td className="p-3">
                      <Badge variant={
                        c.status === "redeemed" ? "success" :
                        c.status === "sent" ? "warning" : "secondary"
                      } className="text-[10px] capitalize">
                        {c.status === "sent" ? "Enviado / Pendiente" : c.status === "redeemed" ? "Canjeado" : c.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
