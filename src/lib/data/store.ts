// src/lib/data/store.ts
import { 
  Tenant, Branch, Employee, Touchpoint, FeedbackResponse, 
  Case, Compensation, Customer, LoyaltyAccount, PointsLedgerEntry, 
  Reward, AlertRule, NotificationItem, GoogleReviewRoutingCounter, AIInsight 
} from "@/types";
import { 
  INITIAL_TENANT, INITIAL_BRANCHES, INITIAL_EMPLOYEES, 
  INITIAL_TOUCHPOINTS, INITIAL_ROUTING_COUNTERS, INITIAL_REWARDS, INITIAL_ALERT_RULES 
} from "./mockData";
import { ReviewRoutingService } from "../services/reviewRoutingService";
import { AIService } from "../services/aiService";
import { NotificationService } from "../services/notificationService";

// Función generadora de 150+ feedbacks realistas
function generateInitialFeedbacks(): { feedbacks: FeedbackResponse[]; cases: Case[]; compensations: Compensation[]; notifications: NotificationItem[] } {
  const feedbacks: FeedbackResponse[] = [];
  const cases: Case[] = [];
  const compensations: Compensation[] = [];
  const notifications: NotificationItem[] = [];

  const branches = ["br_centro", "br_andamar", "br_norte"];
  const employeesByBranch: Record<string, string[]> = {
    br_centro: ["emp_carlos", "emp_luis"],
    br_andamar: ["emp_ana", "emp_sofia"],
    br_norte: ["emp_diego"],
  };

  const samplePositiveComments = [
    "Todo estuvo excelente, la comida deliciosa y el servicio de primera.",
    "Gran ambiente y atención maravillosa. Volveremos pronto.",
    "El mejor café y postre que he probado. 10/10.",
    "Muy atentos en todo momento, nos hicieron sentir como en casa.",
    "Excelente relación calidad y precio. Muy recomendado.",
    "La comida riquísima y llegó súper rápido.",
    "Impecable la limpieza y la música muy agradable.",
    "Nos atendieron de maravilla, felicidades a todo el equipo.",
  ];

  const sampleNeutralComments = [
    "La comida estuvo rica pero tardaron un poco en traer la cuenta.",
    "Buen lugar, aunque había un poco de ruido en la terraza.",
    "El café excelente, pero se equivocaron en un término de la carne al inicio.",
    "Aceptable, la porción es buena pero el servicio fue algo lento.",
  ];

  const sampleNegativeComments = [
    "La comida llegó fría y el mesero tardó mucho en tomarnos la orden.",
    "Pésimo tiempo de espera, esperamos más de 45 minutos por dos platillos.",
    "El servicio fue muy descuidado y la mesa estaba un poco sucia.",
    "Muy mala actitud del personal cuando pedimos cambio de bebida.",
  ];

  const now = new Date("2026-10-20T12:00:00.000Z").getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 1; i <= 150; i++) {
    const timestamp = new Date(now - Math.floor(Math.random() * thirtyDaysMs)).toISOString();
    const branchId = branches[i % branches.length];
    const branchEmployees = employeesByBranch[branchId];
    const employeeId = branchEmployees[i % branchEmployees.length];

    // Distribución: 65% 5★, 20% 4★, 8% 3★, 4% 2★, 3% 1★
    let rating = 5;
    const rand = Math.random();
    if (rand < 0.65) rating = 5;
    else if (rand < 0.85) rating = 4;
    else if (rand < 0.93) rating = 3;
    else if (rand < 0.97) rating = 2;
    else rating = 1;

    let comment: string | undefined = undefined;
    let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "POSITIVE";
    let positiveScore = 85;

    if (rating === 5) {
      comment = Math.random() > 0.4 ? samplePositiveComments[i % samplePositiveComments.length] : undefined;
      sentiment = "POSITIVE";
      positiveScore = 90 + Math.floor(Math.random() * 10);
    } else if (rating === 4) {
      if (Math.random() > 0.5) {
        comment = "Todo estuvo excelente, solamente tardaron un poquito.";
        sentiment = "POSITIVE";
        positiveScore = 82;
      } else {
        comment = sampleNeutralComments[i % sampleNeutralComments.length];
        sentiment = "NEUTRAL";
        positiveScore = 65;
      }
    } else if (rating === 3) {
      comment = sampleNeutralComments[i % sampleNeutralComments.length];
      sentiment = Math.random() > 0.5 ? "NEUTRAL" : "NEGATIVE";
      positiveScore = 45;
    } else {
      comment = sampleNegativeComments[i % sampleNegativeComments.length];
      sentiment = "NEGATIVE";
      positiveScore = 15;
    }

    const categoriesSelected = rating >= 4 
      ? ["servicio", "calidad", "ambiente"] 
      : ["rapidez", "servicio"];

    // Lógica Google Review
    let offered = false;
    let reason: any = "disabled";
    let clickedAt: string | undefined = undefined;
    let offerShownAt: string | undefined = undefined;

    if (rating === 5) {
      offered = true;
      reason = "rating_5_always";
      offerShownAt = timestamp;
      if (Math.random() > 0.45) clickedAt = new Date(new Date(timestamp).getTime() + 15000).toISOString();
    } else if ((rating === 4 || rating === 3) && sentiment === "POSITIVE" && positiveScore >= 75) {
      // Solo algunos entran por cuota
      if (i % 25 === 0) {
        offered = true;
        reason = "positive_3_4_routed";
        offerShownAt = timestamp;
        if (Math.random() > 0.4) clickedAt = new Date(new Date(timestamp).getTime() + 18000).toISOString();
      } else {
        offered = false;
        reason = "quota_exceeded";
      }
    } else if (rating <= 2) {
      offered = false;
      reason = "negative_withheld";
    }

    const responseId = `fb_${String(i).padStart(4, "0")}`;
    let caseId: string | undefined = undefined;

    // Crear Caso si es <= 2 estrellas
    if (rating <= 2) {
      caseId = `case_${String(cases.length + 1).padStart(3, "0")}`;
      const isResolved = i < 140; // Los últimos quedan abiertos/en revisión
      const hasCustomerInfo = Math.random() > 0.3;
      
      const newCase: Case = {
        id: caseId,
        tenantId: "ten_restaurante_demo",
        branchId,
        feedbackResponseId: responseId,
        employeeId,
        status: isResolved ? "resolved" : (cases.length % 2 === 0 ? "new" : "reviewing"),
        severity: rating === 1 ? "critical" : "high",
        assignedToName: "Gerente de Turno",
        customerName: hasCustomerInfo ? (i % 2 === 0 ? "María Fernanda L." : "Roberto Garza") : undefined,
        customerContact: hasCustomerInfo ? (i % 2 === 0 ? "+52 229 555 1234" : "roberto.g@gmail.com") : undefined,
        customerConsent: hasCustomerInfo,
        slaDeadline: new Date(new Date(timestamp).getTime() + 2 * 3600 * 1000).toISOString(),
        firstResponseAt: isResolved ? new Date(new Date(timestamp).getTime() + 1800 * 1000).toISOString() : undefined,
        resolvedAt: isResolved ? new Date(new Date(timestamp).getTime() + 7200 * 1000).toISOString() : undefined,
        internalNotes: rating === 1 
          ? "Incidente de comida fría y demora. Se contactó al comensal de inmediato y se aplicó protocolo de recuperación." 
          : "Demora en servicio durante horario pico. Asignado a supervisor de sala.",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (isResolved) {
        const compId = `comp_${String(compensations.length + 1).padStart(3, "0")}`;
        newCase.compensationId = compId;
        compensations.push({
          id: compId,
          tenantId: "ten_restaurante_demo",
          caseId,
          code: `REC-${1000 + i}-VAL`,
          type: "free_item",
          valueDescription: "Postre artesanal y 2 bebidas de cortesía en próxima visita",
          status: "sent",
          validUntil: "2026-12-31T23:59:59.000Z",
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      cases.push(newCase);

      notifications.push({
        id: `notif_${cases.length}`,
        tenantId: "ten_restaurante_demo",
        title: `Alerta: Experiencia ${rating}★ en ${branchId === "br_centro" ? "Sucursal Centro" : branchId === "br_andamar" ? "Sucursal Andamar" : "Sucursal Norte"}`,
        body: comment || "Comentario negativo registrado.",
        type: "critical_feedback",
        relatedEntityId: caseId,
        isRead: isResolved,
        createdAt: timestamp,
      });
    }

    feedbacks.push({
      id: responseId,
      tenantId: "ten_restaurante_demo",
      branchId,
      touchpointId: branchId === "br_centro" ? "tp_carlos_card" : "tp_ana_card",
      employeeId,
      rating,
      categoriesSelected,
      comment,
      answers: {},
      aiAnalysis: {
        sentiment,
        sentimentConfidence: 0.94,
        positiveScore,
        detectedIssues: rating <= 2 ? ["demora_servicio", "temperatura_alimento"] : [],
        intent: rating >= 4 ? "praise" : rating === 3 ? "suggestion" : "complaint",
        severity: rating <= 2 ? "high" : rating === 3 ? "medium" : "low",
        aiSummary: comment ? `Opinión de ${rating}★: "${comment}"` : `Calificación rápida de ${rating}★`,
      },
      googleReviewRouting: {
        offered,
        reason,
        offerShownAt,
        clickedAt,
      },
      customerContact: rating <= 2 ? {
        name: i % 2 === 0 ? "María Fernanda L." : "Roberto Garza",
        phone: "+52 229 555 1234",
        wantsContactRequested: true,
        consentGiven: true,
      } : undefined,
      caseId,
      sessionMetadata: {
        durationSeconds: 14 + (i % 8),
        deviceType: "mobile",
        ipHashAnonymized: `hash_demo_${i}`,
      },
      createdAt: timestamp,
    });
  }

  // Ordenar de más reciente a más antiguo
  feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  cases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { feedbacks, cases, compensations, notifications };
}

// Inicialización de datos
const generated = generateInitialFeedbacks();

export class DataStore {
  private static tenant: Tenant = INITIAL_TENANT;
  private static branches: Branch[] = [...INITIAL_BRANCHES];
  private static employees: Employee[] = [...INITIAL_EMPLOYEES];
  private static touchpoints: Touchpoint[] = [...INITIAL_TOUCHPOINTS];
  private static routingCounters: GoogleReviewRoutingCounter[] = [...INITIAL_ROUTING_COUNTERS];
  private static rewards: Reward[] = [...INITIAL_REWARDS];
  private static alertRules: AlertRule[] = [...INITIAL_ALERT_RULES];
  private static feedbacks: FeedbackResponse[] = generated.feedbacks;
  private static cases: Case[] = generated.cases;
  private static compensations: Compensation[] = generated.compensations;
  private static notifications: NotificationItem[] = generated.notifications;
  private static customers: Customer[] = [
    {
      id: "cust_01",
      tenantId: "ten_restaurante_demo",
      name: "Mariana Morales",
      email: "mariana.morales@gmail.com",
      phone: "+52 229 888 7766",
      loyaltyAccountId: "loy_01",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-10-20T00:00:00.000Z",
    },
    {
      id: "cust_02",
      tenantId: "ten_restaurante_demo",
      name: "Alejandro Ruiz",
      email: "alejandro.r@outlook.com",
      phone: "+52 229 333 4455",
      loyaltyAccountId: "loy_02",
      createdAt: "2026-04-10T00:00:00.000Z",
      updatedAt: "2026-10-20T00:00:00.000Z",
    },
  ];
  private static loyaltyAccounts: LoyaltyAccount[] = [
    {
      id: "loy_01",
      tenantId: "ten_restaurante_demo",
      customerId: "cust_01",
      currentBalance: 520,
      tier: "silver",
      totalVisits: 8,
      totalPointsEarnedLifetime: 870,
      lastActivityAt: "2026-10-18T14:30:00.000Z",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-10-18T14:30:00.000Z",
    },
    {
      id: "loy_02",
      tenantId: "ten_restaurante_demo",
      customerId: "cust_02",
      currentBalance: 950,
      tier: "gold",
      totalVisits: 14,
      totalPointsEarnedLifetime: 1450,
      lastActivityAt: "2026-10-19T21:00:00.000Z",
      createdAt: "2026-04-10T00:00:00.000Z",
      updatedAt: "2026-10-19T21:00:00.000Z",
    },
  ];
  private static pointsLedger: PointsLedgerEntry[] = [
    {
      id: "led_01",
      tenantId: "ten_restaurante_demo",
      loyaltyAccountId: "loy_01",
      customerId: "cust_01",
      type: "earn",
      points: 50,
      reason: "survey_completion",
      referenceId: "fb_0025",
      createdAt: "2026-10-18T14:30:00.000Z",
    },
    {
      id: "led_02",
      tenantId: "ten_restaurante_demo",
      loyaltyAccountId: "loy_01",
      customerId: "cust_01",
      type: "earn",
      points: 20,
      reason: "branch_visit",
      createdAt: "2026-10-18T14:00:00.000Z",
    },
    {
      id: "led_03",
      tenantId: "ten_restaurante_demo",
      loyaltyAccountId: "loy_01",
      customerId: "cust_01",
      type: "redeem",
      points: -350,
      reason: "reward_redemption",
      referenceId: "rwd_cafe_postre",
      createdAt: "2026-09-15T16:00:00.000Z",
    },
  ];

  // Métodos de Acceso Tenant
  static getTenant(): Tenant {
    return this.tenant;
  }

  static updateTenantSettings(settings: Partial<Tenant["settings"]>): Tenant {
    this.tenant.settings = { ...this.tenant.settings, ...settings };
    this.tenant.updatedAt = new Date().toISOString();
    return this.tenant;
  }

  // Sucursales
  static getBranches(): Branch[] {
    return this.branches;
  }

  static getBranchById(id: string): Branch | undefined {
    return this.branches.find(b => b.id === id);
  }

  static addBranch(branch: Omit<Branch, "id" | "createdAt" | "updatedAt">): Branch {
    const newBranch: Branch = {
      ...branch,
      id: `br_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.branches.push(newBranch);
    return newBranch;
  }

  // Empleados
  static getEmployees(branchId?: string): Employee[] {
    if (branchId) return this.employees.filter(e => e.branchId === branchId);
    return this.employees;
  }

  static getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(e => e.id === id);
  }

  static addEmployee(employee: Omit<Employee, "id" | "metricsSummary" | "createdAt" | "updatedAt">): Employee {
    const newEmp: Employee = {
      ...employee,
      id: `emp_${Math.random().toString(36).substring(2, 9)}`,
      metricsSummary: {
        totalFeedbacks: 0,
        averageRating: 5.0,
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.employees.push(newEmp);
    return newEmp;
  }

  // Touchpoints
  static getTouchpoints(branchId?: string): Touchpoint[] {
    if (branchId) return this.touchpoints.filter(t => t.branchId === branchId);
    return this.touchpoints;
  }

  static getTouchpointByToken(token: string): Touchpoint | undefined {
    return this.touchpoints.find(t => t.secureToken === token && t.isActive);
  }

  static addTouchpoint(tp: Omit<Touchpoint, "id" | "stats" | "createdAt" | "updatedAt">): Touchpoint {
    const newTp: Touchpoint = {
      ...tp,
      id: `tp_${Math.random().toString(36).substring(2, 9)}`,
      stats: {
        scansCount: 0,
        completedSurveysCount: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.touchpoints.push(newTp);
    return newTp;
  }

  static recordTouchpointScan(token: string): void {
    const tp = this.getTouchpointByToken(token);
    if (tp) {
      tp.stats.scansCount += 1;
      tp.stats.lastScannedAt = new Date().toISOString();
      tp.updatedAt = new Date().toISOString();
    }
  }

  // Cuotas de Google Review
  static getMonthlyCounter(tenantId: string, branchId: string): GoogleReviewRoutingCounter {
    const key = ReviewRoutingService.getMonthlyCounterKey(tenantId, branchId);
    let counter = this.routingCounters.find(c => c.id === key);
    if (!counter) {
      const now = new Date();
      counter = {
        id: key,
        tenantId,
        branchId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        positive34Routed: 0,
        lastUpdatedAt: now.toISOString(),
      };
      this.routingCounters.push(counter);
    }
    return counter;
  }

  static incrementMonthly34Counter(tenantId: string, branchId: string): void {
    const counter = this.getMonthlyCounter(tenantId, branchId);
    counter.positive34Routed += 1;
    counter.lastUpdatedAt = new Date().toISOString();
  }

  // Feedbacks
  static getFeedbacks(filters?: { branchId?: string; employeeId?: string; rating?: number }): FeedbackResponse[] {
    let result = [...this.feedbacks];
    if (filters?.branchId) result = result.filter(f => f.branchId === filters.branchId);
    if (filters?.employeeId) result = result.filter(f => f.employeeId === filters.employeeId);
    if (filters?.rating) result = result.filter(f => f.rating === filters.rating);
    return result;
  }

  static async submitFeedback(input: {
    token: string;
    rating: number;
    categoriesSelected?: string[];
    comment?: string;
    customerContact?: {
      name?: string;
      email?: string;
      phone?: string;
      wantsContactRequested: boolean;
      consentGiven: boolean;
    };
  }): Promise<{
    feedbackId: string;
    routingDecision: ReturnType<typeof ReviewRoutingService.evaluate>;
    reviewUrl?: string;
    caseId?: string;
  }> {
    const tp = this.getTouchpointByToken(input.token);
    if (!tp) throw new Error("Touchpoint no válido o revocado.");

    const tenant = this.getTenant();
    const branch = this.getBranchById(tp.branchId);
    if (!branch) throw new Error("Sucursal no encontrada.");

    // Análisis de IA (Gemini o motor semántico de respaldo)
    const aiAnalysis = await AIService.analyzeFeedback(
      input.rating,
      input.comment,
      input.categoriesSelected
    );

    // Consulta de cuota actual de 3-4★
    const counter = this.getMonthlyCounter(tp.tenantId, tp.branchId);

    // Motor de Enrutamiento Google Review
    const routingDecision = ReviewRoutingService.evaluate(
      {
        tenantId: tp.tenantId,
        branchId: tp.branchId,
        rating: input.rating,
        sentiment: aiAnalysis.sentiment,
        sentimentConfidence: aiAnalysis.sentimentConfidence,
        positiveScore: aiAnalysis.positiveScore,
        comment: input.comment,
        categoriesSelected: input.categoriesSelected,
      },
      tenant.settings.reputation,
      counter.positive34Routed
    );

    // Si requería incremento de cuota y se ofreció, incrementamos
    if (routingDecision.requiresQuotaIncrement) {
      this.incrementMonthly34Counter(tp.tenantId, tp.branchId);
    }

    const timestamp = new Date().toISOString();
    const feedbackId = `fb_${Math.random().toString(36).substring(2, 9)}`;
    let caseId: string | undefined = undefined;

    // Crear CASE automático si la experiencia fue de 1 o 2 estrellas
    if (routingDecision.createCaseRequired) {
      caseId = `case_${Math.random().toString(36).substring(2, 9)}`;
      const newCase: Case = {
        id: caseId,
        tenantId: tp.tenantId,
        branchId: tp.branchId,
        feedbackResponseId: feedbackId,
        employeeId: tp.assignedEmployeeId,
        status: "new",
        severity: input.rating === 1 ? "critical" : "high",
        assignedToName: "Gerente de Turno",
        customerName: input.customerContact?.name,
        customerContact: input.customerContact?.phone || input.customerContact?.email,
        customerConsent: !!input.customerContact?.consentGiven,
        slaDeadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        internalNotes: `Experiencia de ${input.rating}★ generada vía QR/NFC (${tp.name}). ${input.comment ? `Comentario: "${input.comment}"` : "Sin comentario adicional."}`,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.cases.unshift(newCase);

      // Notificación y Alerta multicanal en tiempo real
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        tenantId: tp.tenantId,
        title: `🚨 Alerta: Feedback ${input.rating}★ en ${branch.name}`,
        body: input.comment || "Cliente insatisfecho requiere atención.",
        type: "critical_feedback",
        relatedEntityId: caseId,
        isRead: false,
        createdAt: timestamp,
      });

      // Disparo a WhatsApp Cloud API / Email Mock Provider
      await NotificationService.dispatchAlert({
        tenantId: tp.tenantId,
        title: `🚨 Alerta Inmediata: ${input.rating}★ en ${branch.name}`,
        message: input.comment || "Se ha abierto un caso urgente.",
        channels: ["whatsapp", "email", "in_app"],
        recipients: ["+52 229 123 4567"],
        severity: "critical",
      });
    }

    // Persistir feedback
    const newFeedback: FeedbackResponse = {
      id: feedbackId,
      tenantId: tp.tenantId,
      branchId: tp.branchId,
      touchpointId: tp.id,
      employeeId: tp.assignedEmployeeId,
      rating: input.rating,
      categoriesSelected: input.categoriesSelected || [],
      comment: input.comment,
      answers: {},
      aiAnalysis,
      googleReviewRouting: {
        offered: routingDecision.shouldOfferGoogleReview,
        reason: routingDecision.reason,
        offerShownAt: routingDecision.shouldOfferGoogleReview ? timestamp : undefined,
      },
      customerContact: input.customerContact,
      caseId,
      sessionMetadata: {
        durationSeconds: 12,
        deviceType: "mobile",
        ipHashAnonymized: `hash_${Date.now()}`,
      },
      createdAt: timestamp,
    };

    this.feedbacks.unshift(newFeedback);

    // Actualizar métricas del touchpoint
    tp.stats.completedSurveysCount += 1;
    tp.stats.lastCompletedAt = timestamp;

    // Actualizar métricas del empleado si estaba asignado
    if (tp.assignedEmployeeId) {
      const emp = this.getEmployeeById(tp.assignedEmployeeId);
      if (emp) {
        emp.metricsSummary.totalFeedbacks += 1;
        if (input.rating >= 4) emp.metricsSummary.positiveCount += 1;
        else if (input.rating === 3) emp.metricsSummary.neutralCount += 1;
        else emp.metricsSummary.negativeCount += 1;
        
        // Recalcular promedio
        const empFeedbacks = this.feedbacks.filter(f => f.employeeId === emp.id);
        const sum = empFeedbacks.reduce((acc, curr) => acc + curr.rating, 0);
        emp.metricsSummary.averageRating = Number((sum / empFeedbacks.length).toFixed(1));
        emp.metricsSummary.lastFeedbackAt = timestamp;
      }
    }

    return {
      feedbackId,
      routingDecision,
      reviewUrl: routingDecision.shouldOfferGoogleReview ? branch.googleBusiness.reviewUrl : undefined,
      caseId,
    };
  }

  // Registrar clic en Google Review (SEPARADO de offer_shown y NUNCA presumiendo published)
  static recordGoogleReviewClick(feedbackId: string): void {
    const fb = this.feedbacks.find(f => f.id === feedbackId);
    if (fb && fb.googleReviewRouting.offered) {
      fb.googleReviewRouting.clickedAt = new Date().toISOString();
      console.log(`[REPUTATION EVENT] Evento google_review_link_clicked registrado para feedback: ${feedbackId}`);
    }
  }

  // Casos
  static getCases(branchId?: string): Case[] {
    if (branchId) return this.cases.filter(c => c.branchId === branchId);
    return this.cases;
  }

  static getCaseById(id: string): Case | undefined {
    return this.cases.find(c => c.id === id);
  }

  static updateCaseStatus(caseId: string, status: Case["status"], internalNotes?: string): Case | undefined {
    const c = this.getCaseById(caseId);
    if (c) {
      c.status = status;
      if (internalNotes) c.internalNotes = internalNotes;
      c.updatedAt = new Date().toISOString();
      if (status === "resolved") c.resolvedAt = new Date().toISOString();
    }
    return c;
  }

  // Compensaciones
  static getCompensations(): Compensation[] {
    return this.compensations;
  }

  static issueCompensation(input: {
    caseId?: string;
    type: Compensation["type"];
    valueDescription: string;
    valueNumber?: number;
  }): Compensation {
    const comp: Compensation = {
      id: `comp_${Math.random().toString(36).substring(2, 9)}`,
      tenantId: "ten_restaurante_demo",
      caseId: input.caseId,
      code: `VAL-${Math.floor(1000 + Math.random() * 9000)}-CUP`,
      type: input.type,
      valueDescription: input.valueDescription,
      valueNumber: input.valueNumber,
      status: "generated",
      validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.compensations.unshift(comp);

    if (input.caseId) {
      const c = this.getCaseById(input.caseId);
      if (c) {
        c.compensationId = comp.id;
        c.status = "compensation_sent";
        c.updatedAt = new Date().toISOString();
      }
    }
    return comp;
  }

  static redeemCompensation(code: string, branchId: string): boolean {
    const comp = this.compensations.find(c => c.code === code && c.status === "sent");
    if (comp) {
      comp.status = "redeemed";
      comp.redeemedAt = new Date().toISOString();
      comp.redeemedAtBranchId = branchId;
      comp.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Fidelización y Recompensas
  static getRewards(): Reward[] {
    return this.rewards;
  }

  static getLoyaltyAccounts(): LoyaltyAccount[] {
    return this.loyaltyAccounts;
  }

  static getPointsLedger(accountId?: string): PointsLedgerEntry[] {
    if (accountId) return this.pointsLedger.filter(p => p.loyaltyAccountId === accountId);
    return this.pointsLedger;
  }

  static addPoints(accountId: string, points: number, reason: PointsLedgerEntry["reason"]): void {
    const acc = this.loyaltyAccounts.find(a => a.id === accountId);
    if (!acc) return;

    const entry: PointsLedgerEntry = {
      id: `led_${Date.now()}`,
      tenantId: acc.tenantId,
      loyaltyAccountId: acc.id,
      customerId: acc.customerId,
      type: "earn",
      points,
      reason,
      createdAt: new Date().toISOString(),
    };
    this.pointsLedger.unshift(entry);
    acc.currentBalance += points;
    acc.totalPointsEarnedLifetime += points;
    acc.lastActivityAt = new Date().toISOString();
    acc.updatedAt = new Date().toISOString();
  }

  // Notificaciones
  static getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  static markNotificationsAsRead(): void {
    this.notifications.forEach(n => (n.isRead = true));
  }
}
