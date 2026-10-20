"use client";

import React, { useState } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, Building2, CreditCard, Activity, 
  Users, Check, ExternalLink, Zap, Lock 
} from "lucide-react";

export default function SuperAdminPage() {
  const { tenant } = useAuth();

  const plans = [
    {
      id: "trial",
      name: "Trial Gratuito",
      price: "$0",
      branches: 1,
      employees: 5,
      feedbacks: "300 / mes",
      ai: false,
      whatsapp: false,
      loyalty: false,
    },
    {
      id: "basic",
      name: "Basic",
      price: "$49 USD / mes",
      branches: 2,
      employees: 15,
      feedbacks: "1,500 / mes",
      ai: false,
      whatsapp: true,
      loyalty: false,
    },
    {
      id: "professional",
      name: "Professional (Activo)",
      price: "$129 USD / mes",
      branches: 10,
      employees: 50,
      feedbacks: "5,000 / mes",
      ai: true,
      whatsapp: true,
      loyalty: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$299 USD / mes",
      branches: "Ilimitadas",
      employees: "Ilimitados",
      feedbacks: "Ilimitadas",
      ai: true,
      whatsapp: true,
      loyalty: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          <span>Panel SuperAdmin de Plataforma SaaS</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Administración global de empresas suscritas, aislamiento multi-tenant, planes y monitoreo de infraestructura.
        </p>
      </div>

      {/* Métricas Globales de Plataforma */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold">Empresas Activas</CardDescription>
            <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">128</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-emerald-600 font-medium">+14 este mes</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold">Sucursales Físicas</CardDescription>
            <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">412</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">En 8 países</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold">Encuestas Procesadas</CardDescription>
            <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">84,920</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">100% cloud isolation</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold">Estado del Sistema</CardDescription>
            <CardTitle className="text-2xl font-extrabold text-emerald-500 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100% OK</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Firebase & AI operativos</CardContent>
        </Card>
      </div>

      {/* Matriz de Planes de Suscripción SaaS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Modelo de Planes de Suscripción
          </CardTitle>
          <CardDescription className="text-xs">
            Límites y características asignables a los tenants en la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {plans.map((p) => {
              const isCurrent = p.id === tenant.subscription.planId;
              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h3>
                    {isCurrent && <Badge variant="success" className="text-[10px]">Actual</Badge>}
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">{p.price}</p>

                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{p.branches} sucursales</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{p.employees} colaboradores</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{p.feedbacks}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {p.ai ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Lock className="h-3.5 w-3.5 text-slate-400" />}
                      <span>IA Gemini Analytics</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {p.whatsapp ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Lock className="h-3.5 w-3.5 text-slate-400" />}
                      <span>Alertas WhatsApp Cloud</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {p.loyalty ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Lock className="h-3.5 w-3.5 text-slate-400" />}
                      <span>Fidelización & Wallet</span>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
