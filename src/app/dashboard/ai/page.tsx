"use client";

import React, { useState } from "react";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { AIService } from "@/lib/services/aiService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Sparkles, Send, Bot, User, TrendingDown, 
  AlertTriangle, Lightbulb, CheckCircle2, HelpCircle 
} from "lucide-react";

export default function AIPage() {
  const { tenant, selectedBranchId } = useAuth();
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: `¡Hola! Soy tu copiloto de Inteligencia Artificial (Gemini) en ValoraCX para ${tenant.name}. He analizado más de 150 encuestas y opiniones recientes. Puedes preguntarme sobre sucursales, problemas recurrentes, horarios pico o desempeño de colaboradores.`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const sampleQuestions = [
    "¿Cuál fue mi peor sucursal este mes?",
    "¿Qué problema se repite más?",
    "¿Qué meseros mejoraron?",
    "¿Qué días y horarios tenemos más quejas?",
    "Resume los problemas de esta semana.",
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || isThinking) return;

    const userMsg = queryText.trim();
    setInputQuery("");
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setIsThinking(true);

    try {
      const feedbacks = DataStore.getFeedbacks();
      const context = feedbacks.slice(0, 100).map(f => ({
        rating: f.rating,
        branchName: f.branchId === "br_centro" ? "Sucursal Centro" : f.branchId === "br_andamar" ? "Sucursal Andamar" : "Sucursal Norte",
        comment: f.comment,
        createdAt: f.createdAt,
        sentiment: f.aiAnalysis.sentiment,
      }));

      const response = await AIService.queryNaturalLanguage(userMsg, context);

      setMessages(prev => [...prev, { sender: "ai", text: response.answer }]);
    } catch {
      setMessages(prev => [...prev, { sender: "ai", text: "Hubo un error al procesar tu consulta con el motor de IA." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            <span>Inteligencia Artificial con Gemini</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Detección de causa raíz, anomalías operativas y consultas en lenguaje natural ("Pregúntale a tus datos").
          </p>
        </div>

        <Badge variant="success" className="text-xs font-semibold py-1 px-3">
          Gemini Pro Adapter Activo
        </Badge>
      </div>

      {/* Resumen Ejecutivo y Detección de Patrones de IA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Problema Emergente Detectado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            En los últimos 14 días aumentaron un <strong>37%</strong> los comentarios relacionados con <strong>tiempo de espera</strong> en <strong>Sucursal Andamar</strong>, especialmente en la franja de 18:00 a 21:00 hrs.
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Colaboradores Destacados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong>Ana P.</strong> (4.9★) y <strong>Sofía G.</strong> (4.8★) acumulan el 92% de las menciones positivas espontáneas. Carlos R. muestra tendencia alcista en los últimos 7 días.
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900 dark:text-blue-300">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              <span>Recomendación Operativa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Reforzar el pase de cocina durante el turno de viernes y sábado tarde reduciría el <strong>65%</strong> de los feedbacks críticos (1-2★).
          </CardContent>
        </Card>
      </div>

      {/* Módulo: "Pregúntale a tus datos" */}
      <Card className="flex flex-col h-[520px]">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-500" />
              <span>Pregúntale a tus datos</span>
            </CardTitle>
            <span className="text-[11px] text-slate-400">
              Aislamiento estricto de tenant: <strong>{tenant.name}</strong>
            </span>
          </div>
        </CardHeader>

        {/* Mensajes del Chat */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-2xl ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === "user" ? "bg-slate-900 text-white" : "bg-emerald-500 text-slate-950"
              }`}>
                {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-slate-900 text-white dark:bg-emerald-600 rounded-tr-none"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80"
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Bot className="h-4 w-4 animate-spin text-emerald-500" />
              <span>Gemini está consultando las opiniones de tu negocio...</span>
            </div>
          )}
        </div>

        {/* Preguntas sugeridas */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAsk(q)}
              className="text-[11px] font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuery);
          }}
          className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
        >
          <input
            type="text"
            placeholder="Escribe tu pregunta sobre opiniones, quejas, empleados o sucursales..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <Button type="submit" disabled={!inputQuery.trim() || isThinking} className="bg-slate-900 hover:bg-slate-800 text-white">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
