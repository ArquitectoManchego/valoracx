"use client";

import React, { useState, useEffect } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Reward, LoyaltyAccount, PointsLedgerEntry } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Gift, Award, CreditCard, Plus, ArrowUpRight, 
  ArrowDownLeft, Sparkles, CheckCircle2, Wallet, QrCode, Database, RefreshCw 
} from "lucide-react";
import { fetchImperiaClientes } from "@/lib/firebase/config";

export default function LoyaltyPage() {
  const { tenant } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [ledger, setLedger] = useState<PointsLedgerEntry[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<LoyaltyAccount | null>(null);

  // New Reward Form State
  const [isCreatingReward, setIsCreatingReward] = useState(false);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState(400);
  const [newRewardDesc, setNewRewardDesc] = useState("");

  // Wallet Mock Modal State
  const [walletModalAccount, setWalletModalAccount] = useState<LoyaltyAccount | null>(null);

  // Imperia Firebase Clientes State
  const [imperiaClients, setImperiaClients] = useState<any[]>([]);
  const [loadingImperia, setLoadingImperia] = useState(false);

  const syncImperiaDatabase = async () => {
    setLoadingImperia(true);
    try {
      const data = await fetchImperiaClientes();
      setImperiaClients(data);
    } catch (err) {
      console.warn("Could not fetch Imperia clients:", err);
    } finally {
      setLoadingImperia(false);
    }
  };

  const loadData = () => {
    setRewards([...DataStore.getRewards()]);
    const accList = DataStore.getLoyaltyAccounts();
    setAccounts([...accList]);
    if (accList.length > 0 && !selectedAccount) {
      setSelectedAccount(accList[0]);
    }
    setLedger([...DataStore.getPointsLedger()]);
  };

  useEffect(() => {
    loadData();
    syncImperiaDatabase();
  }, []);

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardName.trim()) return;

    const newRwd: Reward = {
      id: `rwd_${Date.now()}`,
      tenantId: "ten_restaurante_demo",
      name: newRewardName.trim(),
      description: newRewardDesc.trim(),
      pointsRequired: Number(newRewardPoints),
      isActive: true,
      termsAndConditions: "Válido en cualquier sucursal presentando código en caja.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    DataStore.getRewards().push(newRwd);
    setIsCreatingReward(false);
    setNewRewardName("");
    setNewRewardDesc("");
    loadData();
  };

  const handleSimulateSurveyPoints = (accId: string) => {
    DataStore.addPoints(accId, 50, "survey_completion");
    loadData();
    alert("¡Se acreditaron +50 puntos por completar encuesta interna! (Transacción registrada en el Ledger)");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="h-6 w-6 text-emerald-500" />
            <span>Fidelización & Monedero de Puntos (Loyalty Ledger)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Contabilidad inmutable de puntos transaccionales por encuestas internas y visitas. Sin incentivos hacia Google Reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={syncImperiaDatabase} 
            disabled={loadingImperia}
            className="flex items-center gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
          >
            <RefreshCw className={`h-4 w-4 ${loadingImperia ? "animate-spin" : ""}`} />
            <span>Sincronizar Clientes Imperia</span>
          </Button>

          <Button onClick={() => setIsCreatingReward(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Crear Recompensa</span>
          </Button>
        </div>
      </div>

      {/* Banner de Conexión a Firebase Imperia */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-50/50 via-slate-50 to-indigo-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-indigo-950/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Conexión Firebase: html-dashboard-integrator (Imperia)</span>
                  <Badge variant="success" className="text-[10px]">Vinculado</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Colección `clientes` conectada en tiempo real. Los clientes de Imperia acumulan puntos automáticamente.
                </CardDescription>
              </div>
            </div>

            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
              {imperiaClients.length > 0 ? `${imperiaClients.length} clientes enlazados` : "Sincronización activa con Firestore"}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Formulario de Alta de Recompensa */}
      {isCreatingReward && (
        <Card className="border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Nueva Recompensa en Catálogo</CardTitle>
            <CardDescription>Define el beneficio y la cantidad de puntos necesarios para el canje.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateReward} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nombre del Beneficio</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Café de especialidad gratis o 2x1"
                  value={newRewardName}
                  onChange={(e) => setNewRewardName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Puntos Requeridos</label>
                <input
                  type="number"
                  required
                  min={50}
                  step={50}
                  value={newRewardPoints}
                  onChange={(e) => setNewRewardPoints(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Términos o Descripción</label>
                <input
                  type="text"
                  placeholder="ej: Válido de lunes a viernes"
                  value={newRewardDesc}
                  onChange={(e) => setNewRewardDesc(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>

              <div className="md:col-span-3 flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingReward(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Guardar Recompensa
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Catálogo de Recompensas */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Catálogo de Recompensas Activas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((r) => (
            <Card key={r.id} className="relative overflow-hidden hover:shadow-md transition">
              <div className="h-1.5 w-full bg-emerald-500" />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                    {r.name}
                  </CardTitle>
                  <Badge variant="success" className="text-xs font-bold font-mono">
                    {r.pointsRequired} pts
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-1">
                  {r.description || "Recompensa para clientes leales."}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-400">
                {r.termsAndConditions}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cuentas de Fidelización & Libro Contable Inmutable (Ledger) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes Leales */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span>Cuentas de Clientes</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Saldos en tiempo real calculados desde el ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.map((acc) => {
              const isSelected = selectedAccount?.id === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-950/40 dark:border-emerald-500/40 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold text-xs ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        Membresía #{acc.id.toUpperCase()}
                      </p>
                      <p className="text-[10px] opacity-70">
                        Nivel {acc.tier.toUpperCase()} • {acc.totalVisits} visitas registradas
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-base text-emerald-400">
                        {acc.currentBalance}
                      </span>
                      <p className="text-[10px] opacity-70">pts</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateSurveyPoints(acc.id);
                      }}
                      className="text-[10px] h-6 px-2 bg-white/10 text-white hover:bg-white/20 border-none"
                    >
                      +50 Pts Encuesta
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWalletModalAccount(acc);
                      }}
                      className="text-[10px] h-6 px-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 border-none font-bold flex items-center gap-1"
                    >
                      <Wallet className="h-3 w-3" />
                      <span>Ver Wallet Pass</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Libro Contable Inmutable (Points Ledger) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Libro Contable de Movimientos (Points Ledger)
                </CardTitle>
                <CardDescription className="text-xs">
                  Auditoría estricta de transacciones (earn, redeem, adjustment). Sin balance flotante.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                Inmutable
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">ID Transacción</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Motivo</th>
                    <th className="p-3">Puntos</th>
                    <th className="p-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {entry.id}
                      </td>
                      <td className="p-3 capitalize font-semibold">
                        <span className={`inline-flex items-center gap-1 ${
                          entry.points > 0 ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {entry.points > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                          <span>{entry.type}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 capitalize">
                        {entry.reason.replace("_", " ")}
                      </td>
                      <td className="p-3 font-mono font-bold text-sm">
                        <span className={entry.points > 0 ? "text-emerald-600" : "text-red-500"}>
                          {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(entry.createdAt).toLocaleDateString("es-MX")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Digital Wallet Pass Preview (Google Wallet / Apple Wallet) */}
      {walletModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Pase Digital (Google & Apple Wallet)
                </span>
              </div>
              <button
                onClick={() => setWalletModalAccount(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Render de la Tarjeta Digital en el Móvil */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-emerald-950 p-6 rounded-2xl border border-emerald-500/30 shadow-xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-tight">{tenant.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Club de Fidelidad • Nivel {walletModalAccount.tier.toUpperCase()}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  V
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Puntos Disponibles</span>
                <p className="text-3xl font-extrabold text-white mt-0.5">
                  {walletModalAccount.currentBalance} <span className="text-emerald-400 text-sm">PTS</span>
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl text-center space-y-1">
                <div className="flex items-center justify-center">
                  <QrCode className="h-28 w-28 text-slate-900" />
                </div>
                <p className="font-mono text-xs font-bold text-slate-900">
                  {walletModalAccount.id.toUpperCase()}
                </p>
                <p className="text-[9px] text-slate-500">Muestra este código al pagar en caja</p>
              </div>
            </div>

            <Button
              onClick={() => setWalletModalAccount(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs"
            >
              Cerrar Previsualización
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
