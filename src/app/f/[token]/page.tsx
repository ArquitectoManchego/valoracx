"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DataStore } from "@/lib/data/store";
import { Touchpoint, Tenant, Branch, Employee } from "@/types";
import { DEFAULT_SURVEY_CATEGORIES } from "@/lib/constants";
import { 
  Star, Send, CheckCircle2, AlertTriangle, ArrowRight, 
  ExternalLink, MessageSquare, ShieldCheck, User 
} from "lucide-react";
import confetti from "canvas-confetti";

export default function CustomerSurveyPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [touchpoint, setTouchpoint] = useState<Touchpoint | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-spam

  // Recovery Contact State (for 1-2 stars)
  const [wantsContact, setWantsContact] = useState<boolean | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  // Completion / Routing State
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<{
    feedbackId: string;
    routingDecision: any;
    reviewUrl?: string;
  } | null>(null);
  const [googleLinkClicked, setGoogleLinkClicked] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Registrar escaneo
    DataStore.recordTouchpointScan(token);

    const tp = DataStore.getTouchpointByToken(token);
    if (tp) {
      setTouchpoint(tp);
      const t = DataStore.getTenant();
      setTenant(t);
      const b = DataStore.getBranchById(tp.branchId);
      setBranch(b || null);
      if (tp.assignedEmployeeId) {
        const emp = DataStore.getEmployeeById(tp.assignedEmployeeId);
        setEmployee(emp || null);
      }
    }
    setLoading(false);
  }, [token]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    if (honeypot) return; // Silent bot rejection

    setSubmitting(true);
    try {
      const result = await DataStore.submitFeedback({
        token,
        rating,
        categoriesSelected: selectedCategories,
        comment: comment.trim() || undefined,
        customerContact: (rating <= 2 && wantsContact && customerContact) ? {
          name: customerName.trim() || undefined,
          phone: customerContact.trim(),
          wantsContactRequested: true,
          consentGiven,
        } : undefined,
      });

      setFeedbackResult(result);
      setCompleted(true);

      // Si fue de 5 estrellas, disparar confeti
      if (rating === 5) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Fallback seguro si canvas-confetti está restringido
        }
      }
    } catch (err: any) {
      alert(err.message || "Error al enviar feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleReviewClick = () => {
    if (!feedbackResult?.feedbackId) return;
    // Registro explícito del evento sin asumir publicación
    DataStore.recordGoogleReviewClick(feedbackResult.feedbackId);
    setGoogleLinkClicked(true);

    if (feedbackResult.reviewUrl) {
      window.open(feedbackResult.reviewUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!touchpoint) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Punto de contacto no disponible</h1>
          <p className="text-sm text-slate-500">
            Este código QR o tarjeta NFC ha sido desactivado o ya no está activo. Por favor acércate al personal del establecimiento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200/50 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        {/* Header con marca y sucursal */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-xl shadow-md mb-2">
            V
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{tenant?.name}</h1>
          <p className="text-xs font-semibold text-slate-500">{branch?.name}</p>

          {/* Empleado atendió si aplica */}
          {employee && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-medium text-slate-800">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                {employee.firstName.charAt(0)}
              </div>
              <span>Te atendió: <strong>{employee.displayName}</strong> ({employee.position})</span>
            </div>
          )}
        </div>

        {/* Pantalla Final si ya completó */}
        {completed && feedbackResult ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 text-center animate-fadeIn">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {feedbackResult.routingDecision.messageTitle}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {feedbackResult.routingDecision.messageSubtitle}
            </p>

            {/* CASO: Oferta de Google Reviews */}
            {feedbackResult.routingDecision.shouldOfferGoogleReview && feedbackResult.reviewUrl && (
              <div className="mt-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Opinión en Google
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  Tu reseña pública ayuda a que otras personas nos conozcan y a reconocer el esfuerzo de nuestro equipo.
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleReviewClick}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md transition"
                  >
                    <span>{feedbackResult.routingDecision.primaryButtonLabel || "Compartir en Google"}</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>

                  {googleLinkClicked && (
                    <p className="text-[11px] text-center text-emerald-700 font-medium pt-1">
                      ¡Gracias por abrir el enlace de Google!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Agradecimiento final si no fue Google Review */}
            {!feedbackResult.routingDecision.shouldOfferGoogleReview && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <p>Tu opinión ya fue recibida internamente por la gerencia.</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">
                Encuesta anónima completada en 15 segundos • ValoraCX
              </p>
            </div>
          </div>
        ) : (
          /* Formulario Rápido (<20 seg) */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
            {/* Honeypot oculto anti-spam */}
            <input
              type="text"
              name="website_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Pregunta 1: 1 a 5 estrellas */}
            <div className="text-center mb-6">
              <label className="block text-base font-bold text-slate-900 mb-3">
                ¿Cómo calificarías tu experiencia hoy?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 focus:outline-none transition-transform active:scale-90"
                    aria-label={`${star} estrellas`}
                  >
                    <Star
                      className={`h-10 w-10 sm:h-12 sm:w-12 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs font-semibold text-slate-500 mt-2">
                  {rating === 5 && "¡Excelente experiencia! ⭐⭐⭐⭐⭐"}
                  {rating === 4 && "Muy buena experiencia ⭐⭐⭐⭐"}
                  {rating === 3 && "Experiencia regular ⭐⭐⭐"}
                  {rating <= 2 && "Experiencia insatisfactoria ⭐"}
                </p>
              )}
            </div>

            {/* Pregunta 2: Categorías destacadas o por mejorar */}
            {rating > 0 && (
              <div className="mb-6 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  {rating >= 4 ? "¿Qué fue lo más destacado?" : "¿En qué debemos mejorar?"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_SURVEY_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pregunta 3: Comentario Opcional */}
            {rating > 0 && (
              <div className="mb-6 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Comentario (opcional)
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe aquí cualquier detalle que quieras compartir..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 resize-none"
                />
              </div>
            )}

            {/* Protocolo de Recuperación para 1 o 2 estrellas */}
            {rating > 0 && rating <= 2 && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50/60 border border-red-200 animate-fadeIn text-left">
                <p className="text-xs font-bold text-red-900 mb-1">
                  ¿Quieres que un responsable se comunique contigo para resolver lo ocurrido?
                </p>
                <p className="text-[11px] text-red-700 mb-3">
                  Tu satisfacción es nuestra máxima prioridad.
                </p>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setWantsContact(true)}
                    className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg border transition ${
                      wantsContact === true
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    Sí, pueden contactarme
                  </button>
                  <button
                    type="button"
                    onClick={() => setWantsContact(false)}
                    className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg border transition ${
                      wantsContact === false
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    No, gracias
                  </button>
                </div>

                {wantsContact && (
                  <div className="space-y-2 pt-2 border-t border-red-100">
                    <input
                      type="text"
                      placeholder="Tu nombre (opcional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp o Teléfono *"
                      required
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800"
                    />
                    <label className="flex items-start gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-0.5 rounded text-red-600"
                      />
                      <span className="text-[10px] text-slate-600 leading-tight">
                        Acepto que el gerente o supervisor me contacte exclusivamente respecto a este incidente.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={Boolean(rating === 0 || submitting || (rating <= 2 && wantsContact && (!customerContact || !consentGiven)))}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg transition active:scale-95"
            >
              {submitting ? (
                <span>Guardando feedback...</span>
              ) : (
                <>
                  <span>Enviar valoración</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer seguro */}
      <footer className="text-center text-[11px] text-slate-400 mt-6">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Privacidad protegida • Sin registro obligatorio</span>
        </div>
      </footer>
    </div>
  );
}
