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

// Función generadora de 150+ feedbacks realistas para Imperia Uniformes
function generateInitialFeedbacks(): { feedbacks: FeedbackResponse[]; cases: Case[]; compensations: Compensation[]; notifications: NotificationItem[] } {
  const feedbacks: FeedbackResponse[] = [];
  const cases: Case[] = [];
  const compensations: Compensation[] = [];
  const notifications: NotificationItem[] = [];

  const branches = ["br_centro", "br_andamar", "br_norte"];
  const branchLabels: Record<string, string> = {
    br_centro: "Imperia Matriz - Tienda Centro",
    br_andamar: "Imperia Sucursal Boca del Río",
    br_norte: "Imperia Sucursal Norte",
  };

  const employeesByBranch: Record<string, string[]> = {
    br_centro: ["emp_carlos", "emp_luis"],
    br_andamar: ["emp_ana", "emp_sofia"],
    br_norte: ["emp_diego"],
  };

  const samplePositiveComments = [
    "Excelente calidad en las telas de los uniformes médicos y el bordado del logo quedó impecable.",
    "La atención de Carlos fue de primera, me ayudó a encontrar la talla exacta para todo mi equipo de trabajo.",
    "Entregaron el pedido empresarial antes de tiempo y las prendas lucen súper profesionales. 10/10.",
    "Gran variedad de modelos, batas y filipinas con telas antifluidos muy cómodas.",
    "Muy amables en mostrador, resolvieron mis dudas y el bordado computarizado quedó perfecto.",
    "Los uniformes escolares son de excelente durabilidad, no se desgastan ni se despintan con las lavadas.",
    "Excelente relación calidad-precio y las instalaciones de la tienda están muy limpias y ordenadas.",
    "Compré uniformes industriales para mi empresa y cumplieron con todas las normas de seguridad. Muy recomendados.",
  ];

  const sampleNeutralComments = [
    "La tela y la costura son de excelente calidad, solamente tardaron un poquito en la entrega del bordado.",
    "Buena variedad de uniformes, aunque se habían agotado un par de tallas medianas en mostrador.",
    "Muy buena confección, pero la fila para pagar en caja estuvo algo lenta en hora pico.",
    "La prenda me quedó muy bien, pero tardaron un poco en avisarme cuando estaba lista para recoger.",
  ];

  const sampleNegativeComments = [
    "Hubo un error en la talla del uniforme solicitado y la entrega demoró más de lo pactado.",
    "El bordado del logotipo vino con un tono ligeramente distinto y tardaron en hacer el ajuste.",
    "Mala experiencia con la entrega de mi pedido institucional, no respetaron la fecha prometida.",
    "No encontré tallas disponibles para entrega inmediata y el asesor no me ofreció alternativas.",
  ];

  const now = new Date("2026-10-20T12:00:00.000Z").getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 1; i <= 150; i++) {
    const timestamp = new Date(now - Math.floor(Math.random() * thirtyDaysMs)).toISOString();
    const branchId = branches[i % branches.length];
    const branchEmployees = employeesByBranch[branchId];
    const employeeId = branchEmployees[i % branchEmployees.length];

    // Distribución: 68% 5★, 20% 4★, 7% 3★, 3% 2★, 2% 1★
    let rating = 5;
    const rand = Math.random();
    if (rand < 0.68) rating = 5;
    else if (rand < 0.88) rating = 4;
    else if (rand < 0.95) rating = 3;
    else if (rand < 0.98) rating = 2;
    else rating = 1;

    let comment: string | undefined = undefined;
    let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "POSITIVE";
    let positiveScore = 85;

    if (rating === 5) {
      comment = Math.random() > 0.35 ? samplePositiveComments[i % samplePositiveComments.length] : undefined;
      sentiment = "POSITIVE";
      positiveScore = 90 + Math.floor(Math.random() * 10);
    } else if (rating === 4) {
      if (Math.random() > 0.5) {
        comment = "La tela y el bordado estuvieron excelentes, solamente tardaron un poquito en la entrega.";
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
      ? ["servicio", "calidad", "bordados"] 
      : ["rapidez", "tallas", "servicio"];

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
        tenantId: "ten_imperia_uniformes",
        branchId,
        feedbackResponseId: responseId,
        employeeId,
        status: isResolved ? "resolved" : (cases.length % 2 === 0 ? "new" : "reviewing"),
        severity: rating === 1 ? "critical" : "high",
        assignedToName: "Encargado de Calidad y Atención",
        customerName: hasCustomerInfo ? (i % 2 === 0 ? "Dr. Fernando Morales" : "Lic. Andrea Garza") : undefined,
        customerContact: hasCustomerInfo ? (i % 2 === 0 ? "+52 229 555 1234" : "andrea.g@empresa.com") : undefined,
        customerConsent: hasCustomerInfo,
        slaDeadline: new Date(new Date(timestamp).getTime() + 2 * 3600 * 1000).toISOString(),
        firstResponseAt: isResolved ? new Date(new Date(timestamp).getTime() + 1800 * 1000).toISOString() : undefined,
        resolvedAt: isResolved ? new Date(new Date(timestamp).getTime() + 7200 * 1000).toISOString() : undefined,
        internalNotes: rating === 1 
          ? "Incidente de bordado o ajuste de talla. Se contactó al cliente de inmediato y se aplicó reposición inmediata de prenda." 
          : "Demora en entrega de pedido en mostrador. Asignado a supervisor de taller para seguimiento.",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (isResolved) {
        const compId = `comp_${String(compensations.length + 1).padStart(3, "0")}`;
        newCase.compensationId = compId;
        compensations.push({
          id: compId,
          tenantId: "ten_imperia_uniformes",
          caseId,
          code: `IMP-${1000 + i}-VAL`,
          type: "free_item",
          valueDescription: "Bordado computarizado de cortesía y ajuste gratuito de prenda en próxima compra",
          status: "sent",
          validUntil: "2026-12-31T23:59:59.000Z",
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      cases.push(newCase);

      notifications.push({
        id: `notif_${cases.length}`,
        tenantId: "ten_imperia_uniformes",
        title: `Alerta: Experiencia ${rating}★ en ${branchLabels[branchId] || branchId}`,
        body: comment || "Inconformidad registrada en confección o entrega.",
        type: "critical_feedback",
        relatedEntityId: caseId,
        isRead: isResolved,
        createdAt: timestamp,
      });
    }

    feedbacks.push({
      id: responseId,
      tenantId: "ten_imperia_uniformes",
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
        detectedIssues: rating <= 2 ? ["demora_entrega_pedido", "problema_ajuste_talla"] : [],
        intent: rating >= 4 ? "praise" : rating === 3 ? "suggestion" : "complaint",
        severity: rating <= 2 ? "high" : rating === 3 ? "medium" : "low",
        aiSummary: comment ? `Opinión de ${rating}★: "${comment}"` : `Calificación rápida de ${rating}★ en mostrador`,
      },
      googleReviewRouting: {
        offered,
        reason,
        offerShownAt,
        clickedAt,
      },
      customerContact: rating <= 2 ? {
        name: i % 2 === 0 ? "Dr. Fernando Morales" : "Lic. Andrea Garza",
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
      tenantId: "ten_imperia_uniformes",
      name: "Dr. Roberto Mendoza",
      email: "dr.mendoza@clinicaveracruz.com",
      phone: "+52 229 888 7766",
      loyaltyAccountId: "loy_01",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-10-20T00:00:00.000Z",
    },
    {
      id: "cust_02",
      tenantId: "ten_imperia_uniformes",
      name: "Lic. Carmen Salgado",
      email: "carmen.salgado@colegio.edu.mx",
      phone: "+52 229 333 4455",
      loyaltyAccountId: "loy_02",
      createdAt: "2026-04-10T00:00:00.000Z",
      updatedAt: "2026-10-20T00:00:00.000Z",
    },
  ];
  private static loyaltyAccounts: LoyaltyAccount[] = [
    {
      id: "loy_01",
      tenantId: "ten_imperia_uniformes",
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
      tenantId: "ten_imperia_uniformes",
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
      tenantId: "ten_imperia_uniformes",
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
      tenantId: "ten_imperia_uniformes",
      loyaltyAccountId: "loy_01",
      customerId: "cust_01",
      type: "earn",
      points: 20,
      reason: "branch_visit",
      createdAt: "2026-10-18T14:00:00.000Z",
    },
    {
      id: "led_03",
      tenantId: "ten_imperia_uniformes",
      loyaltyAccountId: "loy_01",
      customerId: "cust_01",
      type: "redeem",
      points: -250,
      reason: "reward_redemption",
      referenceId: "rwd_bordado_nombre",
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
      googleBusiness: {
        ...branch.googleBusiness,
        reviewUrl: branch.googleBusiness?.reviewUrl || "https://maps.app.goo.gl/TGzALojheibt3cK27",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.branches.push(newBranch);
    return newBranch;
  }

  static updateBranch(branchId: string, updates: Partial<Branch>): Branch | undefined {
    const branch = this.getBranchById(branchId);
    if (branch) {
      if (updates.name) branch.name = updates.name;
      if (updates.phone) branch.phone = updates.phone;
      if (updates.email !== undefined) branch.email = updates.email;
      if (updates.googleBusiness) {
        branch.googleBusiness = { ...branch.googleBusiness, ...updates.googleBusiness };
      }
      if (updates.address) {
        branch.address = { ...branch.address, ...updates.address };
      }
      branch.updatedAt = new Date().toISOString();
    }
    return branch;
  }

  /**
   * Resuelve la URL real de Google Reviews de Imperia Uniformes.
   * Por defecto redirige al perfil oficial en Google Maps:
   * https://maps.app.goo.gl/TGzALojheibt3cK27
   */
  static getEffectiveGoogleReviewUrl(branch?: Branch, tenantName?: string): string {
    const defaultImperiaUrl = "https://maps.app.goo.gl/TGzALojheibt3cK27";
    if (!branch || !branch.googleBusiness?.reviewUrl) {
      return defaultImperiaUrl;
    }
    const url = branch.googleBusiness.reviewUrl.trim();
    if (!url || url.includes("Demo") || url.includes("Example") || url.includes("ChIJCentroDemo123") || url.includes("google.com/maps/search/?api=1")) {
      return defaultImperiaUrl;
    }
    return url;
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

  static incrementMonthlyCounter(tenantId: string, branchId: string): void {
    const counter = this.getMonthlyCounter(tenantId, branchId);
    counter.positive34Routed += 1;
    counter.lastUpdatedAt = new Date().toISOString();
  }

  // Feedback y Envío
  static getFeedbacks(filter?: {
    branchId?: string;
    employeeId?: string;
    minRating?: number;
    maxRating?: number;
    sentiment?: string;
  }): FeedbackResponse[] {
    let list = this.feedbacks;
    if (!filter) return list;

    if (filter.branchId && filter.branchId !== "all") {
      list = list.filter(f => f.branchId === filter.branchId);
    }
    if (filter.employeeId) {
      list = list.filter(f => f.employeeId === filter.employeeId);
    }
    if (filter.minRating) {
      list = list.filter(f => f.rating >= filter.minRating!);
    }
    if (filter.maxRating) {
      list = list.filter(f => f.rating <= filter.maxRating!);
    }
    if (filter.sentiment) {
      list = list.filter(f => f.aiAnalysis.sentiment === filter.sentiment);
    }
    return list;
  }

  /**
   * Flujo Central de Feedback:
   * 1. Valida Touchpoint.
   * 2. Analiza IA (sentimiento + positiveScore).
   * 3. Ejecuta ReviewRoutingService (motor de decisión).
   * 4. Almacena Feedback inmutable.
   * 5. Incrementa contador mensual si corresponde.
   * 6. Dispara alertas / crea casos si es negativo.
   */
  static async submitFeedback(input: {
    token: string;
    rating: number;
    comment?: string;
    categoriesSelected?: string[];
    customerContact?: {
      name?: string;
      phone: string;
      wantsContactRequested: boolean;
      consentGiven: boolean;
    };
    durationSeconds?: number;
  }): Promise<{
    feedbackId: string;
    routingDecision: any;
    reviewUrl?: string;
    caseId?: string;
  }> {
    const tp = this.getTouchpointByToken(input.token);
    if (!tp) {
      throw new Error("Punto de contacto no válido o inactivo");
    }

    const branch = this.getBranchById(tp.branchId);
    if (!branch) {
      throw new Error("Sucursal no encontrada");
    }

    const tenant = this.tenant;
    const timestamp = new Date().toISOString();

    // 1. Análisis Semántico con IA
    const aiAnalysis = await AIService.analyzeFeedback(
      input.rating,
      input.comment,
      input.categoriesSelected || []
    );

    // 2. Consulta Cuota Mensual
    const monthlyCounter = this.getMonthlyCounter(tenant.id, branch.id);

    // 3. Motor de Decisión Ética Google Reviews
    const routingDecision = ReviewRoutingService.evaluate(
      {
        tenantId: tenant.id,
        branchId: branch.id,
        rating: input.rating,
        sentiment: aiAnalysis.sentiment,
        sentimentConfidence: aiAnalysis.sentimentConfidence,
        positiveScore: aiAnalysis.positiveScore,
        comment: input.comment,
        categoriesSelected: input.categoriesSelected,
      },
      tenant.settings.reputation,
      monthlyCounter.positive34Routed
    );

    // Si se ofrece y es 3-4 estrellas, consumimos cuota
    if (routingDecision.shouldOfferGoogleReview && routingDecision.reason === "positive_3_4_routed") {
      this.incrementMonthlyCounter(tenant.id, branch.id);
    }

    const feedbackId = `fb_${Date.now()}`;
    let caseId: string | undefined = undefined;

    // 4. Si es <= 2 estrellas, crear Caso Interno de Recuperación
    if (input.rating <= 2) {
      caseId = `case_${Date.now()}`;
      const newCase: Case = {
        id: caseId,
        tenantId: tenant.id,
        branchId: branch.id,
        feedbackResponseId: feedbackId,
        employeeId: tp.assignedEmployeeId,
        status: "new",
        severity: input.rating === 1 ? "critical" : "high",
        assignedToName: "Encargado de Calidad y Atención",
        customerName: input.customerContact?.name,
        customerContact: input.customerContact?.phone,
        customerConsent: input.customerContact?.consentGiven || false,
        slaDeadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 horas SLA
        internalNotes: input.rating === 1 
          ? "Incidente crítico en calidad o entrega de uniforme. Se contactará de inmediato con protocolo de reemplazo o ajuste." 
          : "Observación de servicio o entrega en mostrador. Asignado a supervisor de taller para seguimiento.",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.cases.unshift(newCase);

      // Disparar Alerta Multicanal
      await NotificationService.dispatchAlert({
        tenantId: tenant.id,
        title: `Alerta Experiencia ${input.rating}★ en ${branch.name}`,
        message: input.comment || `Problemas reportados: ${aiAnalysis.detectedIssues.join(", ") || "Atención requerida"}`,
        channels: ["whatsapp", "email", "in_app"],
        recipients: ["+52 229 123 4567", "atencion@imperiauniformes.com"],
        severity: input.rating === 1 ? "critical" : "high",
        metadata: {
          caseId,
          feedbackId,
          branchName: branch.name,
          employeeName: tp.assignedEmployeeId ? this.getEmployeeById(tp.assignedEmployeeId)?.displayName : undefined,
        },
      });

      // Crear Notificación Interna
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        tenantId: tenant.id,
        title: `Nueva experiencia crítica (${input.rating}★) en ${branch.name}`,
        body: input.comment || `Problemas detectados: ${aiAnalysis.detectedIssues.join(", ") || "Atención requerida"}`,
        type: "critical_feedback",
        relatedEntityId: caseId,
        isRead: false,
        createdAt: timestamp,
      });
    }

    // 5. Almacenar Feedback Inmutable
    const newFeedback: FeedbackResponse = {
      id: feedbackId,
      tenantId: tenant.id,
      branchId: branch.id,
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
      customerContact: input.customerContact ? {
        name: input.customerContact.name,
        phone: input.customerContact.phone,
        wantsContactRequested: input.customerContact.wantsContactRequested,
        consentGiven: input.customerContact.consentGiven,
      } : undefined,
      caseId,
      sessionMetadata: {
        durationSeconds: input.durationSeconds || 15,
        deviceType: "mobile",
        ipHashAnonymized: "hash_anonymized",
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
      reviewUrl: routingDecision.shouldOfferGoogleReview 
        ? this.getEffectiveGoogleReviewUrl(branch, tenant.name) 
        : undefined,
      caseId,
    };
  }

  // Registrar clic en Google Review
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
      tenantId: "ten_imperia_uniformes",
      caseId: input.caseId,
      code: `IMP-${Math.floor(1000 + Math.random() * 9000)}-CUP`,
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
