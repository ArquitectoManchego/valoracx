"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SECTORS, DEFAULT_SURVEY_CATEGORIES } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Building2, Store, Users, Sliders, QrCode, 
  Bell, Gift, CheckCircle2, ArrowRight, ArrowLeft 
} from "lucide-react";

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form States
  const [companyName, setCompanyName] = useState("Café del Puerto");
  const [sector, setSector] = useState("cafe");
  const [branchName, setBranchName] = useState("Sucursal Malecón");
  const [branchAddress, setBranchAddress] = useState("Paseo del Malecón 102");
  const [employeeName, setEmployeeName] = useState("Carlos");
  const [employeePosition, setEmployeePosition] = useState("Barista");
  const [googleUrl, setGoogleUrl] = useState("https://search.google.com/local/writereview?placeid=ChIJExample");
  const [alertPhone, setAlertPhone] = useState("+52 229 123 4567");

  const totalSteps = 7;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const stepsList = [
    { num: 1, title: "Empresa", icon: Building2 },
    { num: 2, title: "Primera Sucursal", icon: Store },
    { num: 3, title: "Colaboradores", icon: Users },
    { num: 4, title: "Encuesta", icon: Sliders },
    { num: 5, title: "NFC y QR", icon: QrCode },
    { num: 6, title: "Alertas", icon: Bell },
    { num: 7, title: "Fidelización", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between py-10 px-4 sm:px-6">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xl mb-3 shadow-lg shadow-emerald-500/20">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Asistente de Configuración Inicial (Onboarding)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pon en marcha tu plataforma de feedback y reputación física en 5 minutos.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {stepsList.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="flex flex-col items-center flex-1 min-w-[65px] text-center">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${isCurrent ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Card Content */}
        <Card className="bg-slate-800/80 border-slate-700 text-slate-100 p-6 backdrop-blur">
          {/* PASO 1: EMPRESA */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Paso 1: Datos de tu Empresa</h3>
              <p className="text-xs text-slate-400">Identidad básica de tu negocio físico.</p>

              <div>
                <label className="block text-xs font-semibold mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Giro / Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
                >
                  {SECTORS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* PASO 2: SUCURSAL */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Paso 2: Crear Primera Sucursal</h3>
              <p className="text-xs text-slate-400">Ubicación y enlace de Google Reviews.</p>

              <div>
                <label className="block text-xs font-semibold mb-1">Nombre de Sucursal</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Dirección Física</label>
                <input
                  type="text"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">URL de Reseñas de Google</label>
                <input
                  type="text"
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
                />
              </div>
            </div>
          )}

          {/* PASO 3: EMPLEADOS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Paso 3: Agregar Primer Colaborador</h3>
              <p className="text-xs text-slate-400">Personal de sala o mostrador que será medido con tarjeta NFC.</p>

              <div>
                <label className="block text-xs font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Puesto</label>
                <input
                  type="text"
                  value={employeePosition}
                  onChange={(e) => setEmployeePosition(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
                />
              </div>
            </div>
          )}

          {/* PASO 4: ENCUESTA */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Paso 4: Configurar Encuesta Rápida</h3>
              <p className="text-xs text-slate-400">Preguntas optimizadas para completarse en menos de 20 segundos.</p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs">
                <p className="font-bold text-emerald-400">1. ¿Cómo fue tu experiencia hoy? (1-5 estrellas obligatoria)</p>
                <p className="font-bold text-emerald-400">2. Categorías destacadas (Atención, Rapidez, Calidad, Limpieza)</p>
                <p className="font-bold text-emerald-400">3. Comentario opcional</p>
                <p className="text-[11px] text-slate-400 italic">
                  Lógica condicional activa: Si califica 1-2★ se activa el formulario de recuperación interna.
                </p>
              </div>
            </div>
          )}

          {/* PASO 5: TARJETAS NFC Y QR */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Paso 5: Generar Tarjetas NFC y QR</h3>
              <p className="text-xs text-slate-400">Se generará el primer token criptográfico seguro.</p>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                <p className="font-bold text-emerald-400">Punto listo: Tarjeta NFC {employeeName} ({employeePosition})</p>
                <p className="text-slate-300">URL generada: /f/tk_demo_welcome</p>
                <p className="text-[11px] text-slate-400">Podrás descargar el QR en SVG y PNG desde el dashboard.</p>
              </div>
            </div>
          )}

          {/* PASO 6: ALERTAS */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Paso 6: Configurar Alertas Inmediatas</h3>
              <p className="text-xs text-slate-400">Recibe avisos al momento de una mala experiencia.</p>

              <div>
                <label className="block text-xs font-semibold mb-1">WhatsApp de Gerencia</label>
                <input
                  type="text"
                  value={alertPhone}
                  onChange={(e) => setAlertPhone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
                />
              </div>
            </div>
          )}

          {/* PASO 7: FIDELIZACIÓN */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Paso 7: Programa de Fidelización Opcional</h3>
              <p className="text-xs text-slate-400">Recompensa a clientes por responder encuestas y visitarte.</p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs space-y-2">
                <p className="font-bold text-emerald-400">✓ 50 puntos automáticos por encuesta interna</p>
                <p className="font-bold text-emerald-400">✓ Monedero digital con Google Wallet / Apple Wallet</p>
                <p className="text-[11px] text-slate-400">Regla estricta: Cero puntos por reseñas de Google para mantener integridad.</p>
              </div>
            </div>
          )}

          {/* Botones de Navegación */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-700/60 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Anterior</span>
            </Button>

            <Button
              size="sm"
              onClick={nextStep}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
            >
              <span>{currentStep === totalSteps ? "Completar y Entrar al Dashboard" : "Siguiente"}</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>

      <footer className="text-center text-xs text-slate-500">
        ValoraCX &copy; 2026 • Asistente de Configuración SaaS
      </footer>
    </div>
  );
}
