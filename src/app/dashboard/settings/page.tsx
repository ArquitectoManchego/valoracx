"use client";

import React, { useState } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Settings, Star, Bell, Shield, Smartphone, 
  Mail, Save, CheckCircle2, MessageSquare, AlertTriangle 
} from "lucide-react";

export default function SettingsPage() {
  const { tenant, refreshData } = useAuth();

  // Settings State
  const [googleReviewsEnabled, setGoogleReviewsEnabled] = useState(
    tenant.settings.reputation.googleReviewsEnabled
  );
  const [autoOffer5Stars, setAutoOffer5Stars] = useState(
    tenant.settings.reputation.autoOffer5Stars
  );
  const [considerPositive4Stars, setConsiderPositive4Stars] = useState(
    tenant.settings.reputation.considerPositive4Stars
  );
  const [considerPositive3Stars, setConsiderPositive3Stars] = useState(
    tenant.settings.reputation.considerPositive3Stars
  );
  const [maxGoogleRouted34, setMaxGoogleRouted34] = useState(
    tenant.settings.reputation.maxGoogleRouted34PerMonth
  );
  const [minPositiveScore, setMinPositiveScore] = useState(
    tenant.settings.reputation.minPositiveScore
  );

  // WhatsApp Alert Mock Config
  const [whatsappPhone, setWhatsappPhone] = useState("+52 229 123 4567");
  const [emailAlert, setEmailAlert] = useState("gerencia@restaurantedemo.com");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.updateTenantSettings({
      reputation: {
        googleReviewsEnabled,
        autoOffer5Stars,
        considerPositive4Stars,
        considerPositive3Stars,
        maxGoogleRouted34PerMonth: Number(maxGoogleRouted34),
        minSentimentRequired: "POSITIVE",
        minPositiveScore: Number(minPositiveScore),
      },
    });
    refreshData();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          <span>Configuración & Reglas de Negocio</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Control de enrutamiento a Google Reviews, cuotas mensuales y canales de notificación en tiempo real.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* SECCIÓN 1: MOTOR GOOGLE REVIEWS */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span>Configuración de Google Reviews (ReviewRoutingService)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Define los parámetros éticos y las cuotas de selección para invitar a clientes a compartir en Google Maps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            {/* Toggle 1: Activar Google Reviews */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Google Reviews</span>
                <p className="text-slate-500">Habilita la opción de ofrecer enlaces a Google al finalizar la encuesta.</p>
              </div>
              <input
                type="checkbox"
                checked={googleReviewsEnabled}
                onChange={(e) => setGoogleReviewsEnabled(e.target.checked)}
                className="h-5 w-5 rounded text-emerald-600 cursor-pointer"
              />
            </label>

            {/* Toggle 2: Enviar automáticamente 5 estrellas */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Enviar automáticamente clientes de 5 estrellas</span>
                <p className="text-slate-500">Ofrecer siempre la invitación neutral a Google a experiencias perfectas.</p>
              </div>
              <input
                type="checkbox"
                checked={autoOffer5Stars}
                onChange={(e) => setAutoOffer5Stars(e.target.checked)}
                className="h-5 w-5 rounded text-emerald-600 cursor-pointer"
              />
            </label>

            {/* Toggle 3: Considerar 4 estrellas positivas */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Considerar feedback positivo de 4 estrellas</span>
                <p className="text-slate-500">Permite invitar clientes de 4★ si satisfacen el análisis semántico y la cuota mensual.</p>
              </div>
              <input
                type="checkbox"
                checked={considerPositive4Stars}
                onChange={(e) => setConsiderPositive4Stars(e.target.checked)}
                className="h-5 w-5 rounded text-emerald-600 cursor-pointer"
              />
            </label>

            {/* Toggle 4: Considerar 3 estrellas positivas */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Considerar feedback positivo de 3 estrellas</span>
                <p className="text-slate-500">Sujeto a cuota mensual y análisis semántico positivo estricto.</p>
              </div>
              <input
                type="checkbox"
                checked={considerPositive3Stars}
                onChange={(e) => setConsiderPositive3Stars(e.target.checked)}
                className="h-5 w-5 rounded text-emerald-600 cursor-pointer"
              />
            </label>

            {/* Parámetros Numéricos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Máximo mensual 3-4 estrellas
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxGoogleRouted34}
                  onChange={(e) => setMaxGoogleRouted34(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 font-bold"
                />
                <span className="text-[10px] text-slate-400">Por sucursal por mes calendario.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sentimiento mínimo requerido
                </label>
                <input
                  type="text"
                  readOnly
                  value="POSITIVE"
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-2 font-bold text-emerald-600"
                />
                <span className="text-[10px] text-slate-400">Verificado por IA Gemini.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Positive Score mínimo (0-100)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={minPositiveScore}
                  onChange={(e) => setMinPositiveScore(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 font-bold"
                />
                <span className="text-[10px] text-slate-400">Recomendado: 75 o superior.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 2: CANALES DE ALERTA (WHATSAPP, EMAIL, IN-APP) */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-500" />
              <span>Reglas de Alertas en Tiempo Real</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Recibe notificaciones inmediatas ante calificaciones críticas (1-2★) o palabras de riesgo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Cloud API (Destinatario Alertas)
                </label>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-500" />
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Mock Provider conectado (listo para Live Token).</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email de Notificación
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <input
                    type="email"
                    value={emailAlert}
                    onChange={(e) => setEmailAlert(e.target.value)}
                    className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Para resúmenes y alertas de casos sin resolver.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón Guardar */}
        <div className="flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Configuración actualizada correctamente</span>
            </span>
          )}
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6">
            <Save className="h-4 w-4 mr-1.5" />
            <span>Guardar Configuración</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
