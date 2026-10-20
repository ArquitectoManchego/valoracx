// src/lib/services/reviewRoutingService.ts
import { FeedbackResponse, GoogleReviewRoutingCounter, SentimentType, Tenant } from "@/types";

export interface RoutingEvaluationInput {
  tenantId: string;
  branchId: string;
  rating: number;
  sentiment: SentimentType;
  sentimentConfidence: number;
  positiveScore: number;
  comment?: string;
  categoriesSelected?: string[];
}

export interface RoutingDecision {
  shouldOfferGoogleReview: boolean;
  reason: 
    | "rating_5_always" 
    | "positive_3_4_routed" 
    | "quota_exceeded" 
    | "low_positive_score" 
    | "negative_withheld" 
    | "disabled";
  messageTitle: string;
  messageSubtitle: string;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  requiresQuotaIncrement: boolean;
  createCaseRequired: boolean;
}

export class ReviewRoutingService {
  /**
   * Determina si se debe ofrecer al cliente publicar en Google Reviews
   * de acuerdo con las reglas de reputación ética, puntuación, sentimiento y cuota mensual.
   */
  static evaluate(
    input: RoutingEvaluationInput,
    tenantSettings: Tenant["settings"]["reputation"],
    currentMonthly34Count: number
  ): RoutingDecision {
    // Si la reputación en Google está desactivada a nivel tenant
    if (!tenantSettings.googleReviewsEnabled) {
      return {
        shouldOfferGoogleReview: false,
        reason: "disabled",
        messageTitle: "¡Muchas gracias por tu opinión!",
        messageSubtitle: "Tus comentarios nos ayudan a seguir mejorando cada día.",
        requiresQuotaIncrement: false,
        createCaseRequired: input.rating <= 2,
      };
    }

    // CASO 1: 5 ESTRELLAS
    if (input.rating === 5) {
      if (tenantSettings.autoOffer5Stars) {
        return {
          shouldOfferGoogleReview: true,
          reason: "rating_5_always",
          messageTitle: "¡Muchas gracias por tu opinión!",
          messageSubtitle: "¿Te gustaría compartir también tu experiencia en Google?",
          primaryButtonLabel: "Compartir mi experiencia en Google",
          secondaryButtonLabel: "Finalizar",
          requiresQuotaIncrement: false, // 5★ no consumen la cuota 3-4★
          createCaseRequired: false,
        };
      } else {
        return {
          shouldOfferGoogleReview: false,
          reason: "disabled",
          messageTitle: "¡Muchas gracias por tu opinión!",
          messageSubtitle: "Nos alegra enormemente que hayas tenido una experiencia de 5 estrellas.",
          requiresQuotaIncrement: false,
          createCaseRequired: false,
        };
      }
    }

    // CASO 4: 1 O 2 ESTRELLAS (Experiencia negativa o deficiente)
    if (input.rating <= 2) {
      return {
        shouldOfferGoogleReview: false,
        reason: "negative_withheld",
        messageTitle: "Lamentamos que tu experiencia no haya sido la esperada.",
        messageSubtitle: "Gracias por contarnos lo ocurrido. Tu opinión nos ayuda a mejorar de inmediato.",
        requiresQuotaIncrement: false,
        createCaseRequired: true,
      };
    }

    // CASO 2 Y 3: 4 O 3 ESTRELLAS (Candidatos con evaluación semántica y cuota mensual)
    const is3Star = input.rating === 3;
    const is4Star = input.rating === 4;

    const allowedBySetting = (is4Star && tenantSettings.considerPositive4Stars) || 
                            (is3Star && tenantSettings.considerPositive3Stars);

    if (!allowedBySetting) {
      return {
        shouldOfferGoogleReview: false,
        reason: "disabled",
        messageTitle: "¡Gracias por ayudarnos a mejorar!",
        messageSubtitle: "Valoramos mucho tu tiempo y tus comentarios sinceros.",
        requiresQuotaIncrement: false,
        createCaseRequired: false,
      };
    }

    // Comprobar sentimiento requerido y positiveScore
    const satisfiesSentiment = input.sentiment === tenantSettings.minSentimentRequired;
    const satisfiesScore = input.positiveScore >= tenantSettings.minPositiveScore;

    if (!satisfiesSentiment || !satisfiesScore) {
      return {
        shouldOfferGoogleReview: false,
        reason: "low_positive_score",
        messageTitle: "¡Gracias por ayudarnos a mejorar!",
        messageSubtitle: "Tomaremos muy en cuenta tus sugerencias para perfeccionar nuestro servicio.",
        requiresQuotaIncrement: false,
        createCaseRequired: false,
      };
    }

    // Comprobar cuota mensual compartida para 3★ y 4★ (MAX_GOOGLE_ROUTED_3_4_PER_MONTH)
    const maxQuota = tenantSettings.maxGoogleRouted34PerMonth ?? 2;

    if (currentMonthly34Count < maxQuota) {
      // Elegible: Mostrar Google Review y marcar para incrementar el contador de la sucursal
      return {
        shouldOfferGoogleReview: true,
        reason: "positive_3_4_routed",
        messageTitle: "¡Muchas gracias por tu valoración!",
        messageSubtitle: "¿Te gustaría compartir también tu experiencia en Google?",
        primaryButtonLabel: "Compartir mi experiencia en Google",
        secondaryButtonLabel: "Finalizar",
        requiresQuotaIncrement: true,
        createCaseRequired: false,
      };
    } else {
      // Cuota mensual alcanzada (ej. ya se enviaron 2 este mes en esta sucursal)
      return {
        shouldOfferGoogleReview: false,
        reason: "quota_exceeded",
        messageTitle: "¡Gracias por ayudarnos a mejorar!",
        messageSubtitle: "Agradecemos enormemente tus comentarios constructivos.",
        requiresQuotaIncrement: false,
        createCaseRequired: false,
      };
    }
  }

  /**
   * Genera el ID compuesto para el contador mensual de la sucursal
   * Formato: `${tenantId}_${branchId}_${YYYY}-${MM}`
   */
  static getMonthlyCounterKey(tenantId: string, branchId: string, date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${tenantId}_${branchId}_${year}-${month}`;
  }
}
