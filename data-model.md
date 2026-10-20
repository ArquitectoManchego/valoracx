# Modelo de Datos: ValoraCX (Cloud Firestore)

Este documento especifica el esquema completo de colecciones, campos, tipos, restricciones e índices para la arquitectura multi-tenant en Cloud Firestore.

---

## 1. Convenciones y Estructura
- **Aislamiento:** Toda entidad dentro del ámbito de un negocio incluye obligatoriamente `tenantId: string`.
- **Identificadores:** IDs opacos generados aleatoriamente (UUID v4 / nanoid / Firestore Auto-ID). Ningún identificador secuencial es expuesto al usuario.
- **Timestamps:** Todos los documentos incluyen `createdAt: Timestamp` y `updatedAt: Timestamp`.

---

## 2. Catálogo de Colecciones

### 2.1. `tenants`
Datos de la empresa u organización suscrita al SaaS.
```typescript
interface Tenant {
  id: string; // ej: "ten_9f82d1c"
  name: string; // ej: "Grupo Gastronómico del Sol"
  legalName?: string;
  slug: string; // "grupo-gastronomico-del-sol"
  sector: "restaurant" | "cafe" | "hotel" | "retail" | "clinic" | "salon" | "services" | "other";
  country: string; // "MX"
  timezone: string; // "America/Mexico_City"
  currency: string; // "MXN"
  defaultLanguage: "es" | "en";
  branding: {
    logoUrl?: string;
    primaryColor: string; // "#0F172A"
    accentColor: string; // "#10B981"
    backgroundColor: string; // "#F8FAFC"
    fontFamily?: string;
  };
  subscription: {
    planId: "trial" | "basic" | "professional" | "enterprise";
    status: "active" | "past_due" | "canceled" | "trialing";
    currentPeriodEnd: Timestamp;
    limits: {
      branches: number;
      employees: number;
      monthlyFeedbacks: number;
      aiInsightsEnabled: boolean;
      whatsappAlertsEnabled: boolean;
      loyaltyEnabled: boolean;
    };
  };
  settings: {
    reputation: {
      googleReviewsEnabled: boolean;
      autoOffer5Stars: boolean;
      considerPositive4Stars: boolean;
      considerPositive3Stars: boolean;
      maxGoogleRouted34PerMonth: number; // default: 2
      minSentimentRequired: "POSITIVE";
      minPositiveScore: number; // default: 75
    };
    loyalty: {
      enabled: boolean;
      pointsPerSurvey: number; // default: 50
      pointsPerVisit: number; // default: 20
      pointsExpiryDays: number; // default: 365
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.2. `users`
Usuarios de la plataforma (operadores, gerentes, propietarios, superadmins).
```typescript
interface User {
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoUrl?: string;
  phoneNumber?: string;
  isPlatformSuperAdmin: boolean; // default: false
  preferredLanguage: "es" | "en";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.3. `memberships`
Vinculación usuario-empresa con rol RBAC específico y alcance geográfico/operativo.
```typescript
interface Membership {
  id: string; // "mem_..."
  tenantId: string;
  userId: string;
  role: 
    | "superadmin"        // Superadmin de la plataforma
    | "owner"             // Propietario del tenant
    | "corporate_admin"   // Administrador corporativo
    | "regional_manager"  // Gerente regional
    | "branch_manager"    // Gerente de sucursal
    | "supervisor"        // Supervisor de área/turno
    | "employee"          // Empleado con vista restringida a su propio desempeño
    | "analyst";          // Solo lectura para analítica
  scope: {
    regionIds?: string[]; // Si aplica
    branchIds?: string[]; // Si aplica
    employeeId?: string; // Si el rol es 'employee', vinculado a su ficha
  };
  status: "active" | "invited" | "suspended";
  invitedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.4. `regions` y `branches`
```typescript
interface Region {
  id: string;
  tenantId: string;
  name: string; // "Región Golfo"
  code?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Branch {
  id: string;
  tenantId: string;
  regionId?: string;
  name: string; // "Sucursal Andamar"
  code: string; // "AND-01"
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email?: string;
  timezone: string;
  operatingHours: Record<string, { open: string; close: string; closed?: boolean }>;
  googleBusiness: {
    placeId?: string;
    reviewUrl: string; // https://search.google.com/local/writereview?placeid=...
    mapsUrl?: string;
    currentRating?: number;
    totalReviews?: number;
    lastSyncedAt?: Timestamp;
  };
  areas: string[]; // ["Terraza", "Salón Principal", "Bar"]
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.5. `employees`
Colaboradores medidos en el punto de servicio.
```typescript
interface Employee {
  id: string;
  tenantId: string;
  branchId: string;
  firstName: string;
  lastName: string;
  displayName: string; // "Carlos R."
  avatarUrl?: string;
  position: string; // "Mesero", "Hostess", "Barista", "Médico"
  email?: string;
  phone?: string;
  shift?: "morning" | "afternoon" | "night" | "flexible";
  isActive: boolean;
  metricsSummary: {
    totalFeedbacks: number;
    averageRating: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    npsScore?: number;
    lastFeedbackAt?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.6. `touchpoints` (Puntos de Contacto NFC y QR)
El nexo físico entre el cliente y el sistema.
```typescript
interface Touchpoint {
  id: string;
  tenantId: string;
  branchId: string;
  name: string; // "Tarjeta Carlos R." o "Mesa 04 Terraza"
  type: 
    | "employee_card" 
    | "table_sticker" 
    | "counter_sign" 
    | "packaging" 
    | "receipt" 
    | "whatsapp" 
    | "general_qr" 
    | "other";
  secureToken: string; // Token aleatorio alfanumérico seguro (ej: "tk_7hX9aL2qP")
  publicUrl: string; // https://dominio.com/f/{secureToken}
  nfcPayloadUrl: string; // URL idéntica lista para ser grabada físicamente en chips NFC NTAG213/215
  assignedEmployeeId?: string;
  tableNumber?: string;
  area?: string;
  campaign?: string;
  isActive: boolean;
  stats: {
    scansCount: number;
    completedSurveysCount: number;
    lastScannedAt?: Timestamp;
    lastCompletedAt?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.7. `surveyTemplates` y `surveys`
Definición modular de encuestas y preguntas.
```typescript
interface SurveyQuestion {
  id: string;
  order: number;
  type: "rating_stars" | "emojis" | "nps" | "yes_no" | "multiple_choice" | "multi_select" | "scale" | "short_text" | "comment_box";
  title: string;
  subtitle?: string;
  isRequired: boolean;
  options?: Array<{ label: string; value: string; sentimentHint?: "positive" | "negative" }>;
  condition?: {
    dependsOnQuestionId: string;
    operator: "equals" | "less_than" | "greater_than";
    value: any;
  };
}

interface Survey {
  id: string;
  tenantId: string;
  branchId?: string; // Opcional (aplica a todas si está en blanco)
  name: string;
  status: "published" | "draft" | "archived";
  welcomeMessage: string;
  questions: SurveyQuestion[];
  categories: string[]; // ["servicio", "comida", "rapidez", "limpieza", "ambiente", "precio_calidad"]
  thankYouMessage: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.8. `feedbackResponses`
Registro atómico e inalterable de cada experiencia enviada por un cliente.
```typescript
interface FeedbackResponse {
  id: string;
  tenantId: string;
  branchId: string;
  touchpointId: string;
  employeeId?: string;
  tableNumber?: string;
  shift?: string;
  
  rating: number; // 1 a 5
  npsScore?: number; // 0 a 10 si se incluyó pregunta NPS
  categoriesSelected: string[];
  comment?: string;
  answers: Record<string, any>;
  
  // Evaluación y Enriquecimiento IA
  aiAnalysis: {
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    sentimentConfidence: number; // 0.0 - 1.0
    positiveScore: number; // 0 - 100
    detectedIssues: string[]; // ["demora_servicio", "temperatura_comida"]
    intent: "praise" | "complaint" | "suggestion" | "inquiry";
    severity: "low" | "medium" | "high" | "critical";
    aiSummary?: string;
  };
  
  // Decisión del Motor Google Review
  googleReviewRouting: {
    offered: boolean;
    reason: "rating_5_always" | "positive_3_4_routed" | "quota_exceeded" | "low_positive_score" | "negative_withheld" | "disabled";
    offerShownAt?: Timestamp;
    clickedAt?: Timestamp;
  };
  
  // Datos del Cliente (Opcionales con Consentimiento)
  customerContact?: {
    name?: string;
    email?: string;
    phone?: string;
    wantsContactRequested: boolean;
    consentGiven: boolean;
  };
  
  // Vínculos Operativos
  caseId?: string; // Si se generó un caso por 1-2★ o queja
  loyaltyAccountId?: string; // Si se vinculó cliente
  
  // Metadatos Técnicos Seguros
  sessionMetadata: {
    durationSeconds: number;
    userAgentTruncated?: string;
    deviceType: "mobile" | "tablet" | "desktop";
    ipHashAnonymized: string; // SHA-256(IP + salt) - NUNCA IP cruda
  };
  
  createdAt: Timestamp;
}
```

### 2.9. `googleReviewRoutingCounters`
Control de cuota mensual estricto por sucursal (máximo 2 opiniones positivas de 3 o 4 estrellas por mes calendario).
```typescript
interface GoogleReviewRoutingCounter {
  id: string; // Formato lógico: `${tenantId}_${branchId}_${YYYY}-${MM}` (ej: "ten1_br01_2026-10")
  tenantId: string;
  branchId: string;
  year: number; // 2026
  month: number; // 10
  positive34Routed: number; // 0, 1, 2 (máximo permitido)
  lastUpdatedAt: Timestamp;
}
```

### 2.10. `cases` y `caseEvents`
Módulo de Gestión de Incidentes para experiencias negativas (1-2★ o quejas críticas).
```typescript
interface Case {
  id: string;
  tenantId: string;
  branchId: string;
  feedbackResponseId: string;
  employeeId?: string;
  
  status: "new" | "reviewing" | "contacted" | "compensation_sent" | "resolved" | "closed";
  severity: "low" | "medium" | "high" | "critical";
  assignedToUserId?: string;
  assignedToName?: string;
  
  customerName?: string;
  customerContact?: string;
  customerConsent: boolean;
  
  slaDeadline: Timestamp;
  firstResponseAt?: Timestamp;
  resolvedAt?: Timestamp;
  
  internalNotes: string;
  compensationId?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CaseEvent {
  id: string;
  caseId: string;
  tenantId: string;
  performedByUserId: string;
  performedByName: string;
  eventType: "status_changed" | "note_added" | "assigned" | "compensation_issued" | "customer_contacted";
  details: string;
  createdAt: Timestamp;
}
```

### 2.11. `compensations`
Recuperación del cliente con códigos únicos redimibles.
```typescript
interface Compensation {
  id: string;
  tenantId: string;
  caseId?: string;
  customerId?: string;
  code: string; // ej: "REC-9482-VAL"
  type: "coupon" | "discount_percent" | "free_item" | "credit_amount" | "custom_gift";
  valueDescription: string; // "Café y postre de cortesía en tu próxima visita"
  valueNumber?: number; // ej: 100% o $150 MXN
  status: "generated" | "sent" | "redeemed" | "expired";
  validUntil: Timestamp;
  redeemedAt?: Timestamp;
  redeemedAtBranchId?: string;
  redeemedByEmployeeId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.12. `customers`, `loyaltyAccounts` y `pointsLedger`
Fidelización con contabilidad inmutable.
```typescript
interface Customer {
  id: string;
  tenantId: string;
  name?: string;
  email?: string;
  phone?: string;
  loyaltyAccountId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface LoyaltyAccount {
  id: string;
  tenantId: string;
  customerId: string;
  currentBalance: number; // Calculado y sincronizado a partir del ledger
  tier: "bronze" | "silver" | "gold" | "platinum";
  totalVisits: number;
  totalPointsEarnedLifetime: number;
  lastActivityAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PointsLedgerEntry {
  id: string;
  tenantId: string;
  loyaltyAccountId: string;
  customerId: string;
  type: "earn" | "redeem" | "adjustment" | "expiration" | "refund";
  points: number; // Positivo para earn/refund, negativo para redeem/expiration
  reason: "survey_completion" | "branch_visit" | "reward_redemption" | "manual_adjustment" | "expiry_period";
  referenceId?: string; // ID de la encuesta o recompensa
  createdAt: Timestamp;
}
```

### 2.13. `rewards` y `redemptions`
```typescript
interface Reward {
  id: string;
  tenantId: string;
  name: string; // "Cena para dos personas"
  description: string;
  imageUrl?: string;
  pointsRequired: number; // ej: 800
  isActive: boolean;
  validBranchIds?: string[]; // Válido en todas si está vacío
  termsAndConditions: string;
  stockLimit?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Redemption {
  id: string;
  tenantId: string;
  rewardId: string;
  loyaltyAccountId: string;
  customerId: string;
  redemptionCode: string; // "VAL-RWD-7381"
  status: "pending_claim" | "claimed" | "cancelled" | "expired";
  claimedAt?: Timestamp;
  claimedAtBranchId?: string;
  verifiedByEmployeeId?: string;
  createdAt: Timestamp;
}
```

### 2.14. `alerts` y `notifications`
```typescript
interface AlertRule {
  id: string;
  tenantId: string;
  name: string;
  condition: 
    | "rating_less_equal_2" 
    | "keyword_flagged" 
    | "employee_rating_below" 
    | "negative_spike_hourly";
  parameters: Record<string, any>; // { ratingThreshold: 2, keyword: "intoxicación", hourlyLimit: 3 }
  channels: Array<"whatsapp" | "email" | "in_app">;
  targetRecipients: string[]; // ["+522291234567", "gerente@restaurante.com"]
  isActive: boolean;
  createdAt: Timestamp;
}

interface NotificationItem {
  id: string;
  tenantId: string;
  userId?: string; // Si es in-app para usuario específico
  title: string;
  body: string;
  type: "critical_feedback" | "sla_warning" | "case_assigned" | "milestone_reached";
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: Timestamp;
}
```

### 2.15. `aiInsights`
Resúmenes ejecutivos, análisis de causa raíz y registro de "Pregúntale a tus datos".
```typescript
interface AIInsight {
  id: string;
  tenantId: string;
  scope: { branchId?: string; timeframe: "day" | "week" | "month" };
  headline: string; // "En los últimos 14 días aumentaron 37% los comentarios relacionados con tiempo de espera..."
  summary: string;
  rootCauses: Array<{ issue: string; occurrences: number; recommendation: string }>;
  topPerformers: string[];
  areasOfConcern: string[];
  suggestedActions: string[];
  generatedAt: Timestamp;
}
```

---

## 3. Índices Compuestos Requeridos (Firestore)

1. `feedbackResponses`: `tenantId` ASC, `createdAt` DESC
2. `feedbackResponses`: `tenantId` ASC, `branchId` ASC, `createdAt` DESC
3. `feedbackResponses`: `tenantId` ASC, `employeeId` ASC, `createdAt` DESC
4. `feedbackResponses`: `tenantId` ASC, `rating` ASC, `createdAt` DESC
5. `cases`: `tenantId` ASC, `status` ASC, `createdAt` DESC
6. `cases`: `tenantId` ASC, `branchId` ASC, `status` ASC
7. `touchpoints`: `secureToken` ASC (Unique)
8. `pointsLedger`: `loyaltyAccountId` ASC, `createdAt` DESC
9. `googleReviewRoutingCounters`: `tenantId` ASC, `branchId` ASC, `year` ASC, `month` ASC
