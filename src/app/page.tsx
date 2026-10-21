"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  QrCode, LayoutDashboard, Sparkles, Star, 
  ShieldCheck, ArrowRight, Smartphone, Users, Gift 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-bold text-xl shadow-lg shadow-emerald-500/20">
            V
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight">ValoraCX</span>
            <span className="ml-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              SaaS Multi-Tenant
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/onboarding">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
              Wizard Onboarding
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20">
              Ir al Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-emerald-400 font-medium mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Feedback en 10-20 seg sin descargas + Enrutamiento Ético a Google</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          La plataforma de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">experiencia y reputación</span> para negocios físicos
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Permite a tus clientes y compradores calificar a tu equipo acercando su teléfono a tarjetas NFC o escaneando un QR. Recupera clientes insatisfechos en segundos y potencia tus reseñas públicas con IA.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 h-12 shadow-xl shadow-emerald-500/20 flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              <span>Abrir Panel Administrativo</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/f/tk_carlos_centro_01" target="_blank" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-200 hover:bg-slate-800 h-12 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <span>Probar Encuesta Carlos R. (NFC/QR)</span>
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-2xl bg-slate-800/40 border border-slate-800 p-6 backdrop-blur">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Star className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Google Reviews Routing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enrutamiento ético: 5★ siempre ofrecidas. 3★ y 4★ con cuota mensual controlada (máx 2 por sucursal). Feedback negativo 100% retenido para recuperación.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/40 border border-slate-800 p-6 backdrop-blur">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Medición de Colaboradores</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Métricas reales basadas en feedback interno genuino (sin metas tóxicas de Google reviews). Rankings, comparativas y reconocimientos.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/40 border border-slate-800 p-6 backdrop-blur">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Gift className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Recuperación & Fidelización</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Creación inmediata de casos y emisión de compensaciones con código QR. Libro contable inmutable de puntos transaccionales y pases digitales.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        ValoraCX SaaS &copy; 2026. Todos los derechos reservados. Diseñado para negocios físicos de alta exigencia.
      </footer>
    </div>
  );
}
