// src/types/index.ts

export type TenantSector = 
  | "restaurant" 
  | "cafe" 
  | "hotel" 
  | "retail" 
  | "clinic" 
  | "salon" 
  | "services" 
  | "other";

export type SubscriptionPlanId = "trial" | "basic" | "professional" | "enterprise";

export type RoleType = 
  | "superadmin"
  | "owner"
  | "corporate_admin"
  | "regional_manager"
  | "branch_manager"
  | "supervisor"
  | "employee"
  | "analyst";

export interface Tenant {
  id: string;
  name: string;
  legalName?: string;
  slug: string;
  sector: TenantSector;
  country: string;
  timezone: string;
  currency: string;
  defaultLanguage: "es" | "en";
  branding: {
    logoUrl?: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily?: string;
  };
  subscription: {
    planId: SubscriptionPlanId;
    status: "active" | "past_due" | "canceled" | "trialing";
    currentPeriodEnd: string;
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
      maxGoogleRouted34PerMonth: number; // default 2
      minSentimentRequired: "POSITIVE";
      minPositiveScore: number; // default 75
    };
    loyalty: {
      enabled: boolean;
      pointsPerSurvey: number;
      pointsPerVisit: number;
      pointsExpiryDays: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoUrl?: string;
  phoneNumber?: string;
  isPlatformSuperAdmin: boolean;
  preferredLanguage: "es" | "en";
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  tenantId: string;
  userId: string;
  role: RoleType;
  scope: {
    regionIds?: string[];
    branchIds?: string[];
    employeeId?: string;
  };
  status: "active" | "invited" | "suspended";
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  regionId?: string;
  name: string;
  code: string;
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
    reviewUrl: string;
    mapsUrl?: string;
    currentRating?: number;
    totalReviews?: number;
    lastSyncedAt?: string;
  };
  areas: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  branchId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  position: string;
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
    lastFeedbackAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type TouchpointType = 
  | "employee_card" 
  | "table_sticker" 
  | "counter_sign" 
  | "packaging" 
  | "receipt" 
  | "whatsapp" 
  | "general_qr" 
  | "other";

export interface Touchpoint {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  type: TouchpointType;
  secureToken: string;
  publicUrl: string;
  nfcPayloadUrl: string;
  assignedEmployeeId?: string;
  tableNumber?: string;
  area?: string;
  campaign?: string;
  isActive: boolean;
  stats: {
    scansCount: number;
    completedSurveysCount: number;
    lastScannedAt?: string;
    lastCompletedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
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

export interface Survey {
  id: string;
  tenantId: string;
  branchId?: string;
  name: string;
  status: "published" | "draft" | "archived";
  welcomeMessage: string;
  questions: SurveyQuestion[];
  categories: string[];
  thankYouMessage: string;
  createdAt: string;
  updatedAt: string;
}

export type SentimentType = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export interface FeedbackResponse {
  id: string;
  tenantId: string;
  branchId: string;
  touchpointId: string;
  employeeId?: string;
  tableNumber?: string;
  shift?: string;
  
  rating: number; // 1 to 5
  npsScore?: number;
  categoriesSelected: string[];
  comment?: string;
  answers: Record<string, any>;
  
  aiAnalysis: {
    sentiment: SentimentType;
    sentimentConfidence: number; // 0.0 - 1.0
    positiveScore: number; // 0 - 100
    detectedIssues: string[];
    intent: "praise" | "complaint" | "suggestion" | "inquiry";
    severity: "low" | "medium" | "high" | "critical";
    aiSummary?: string;
  };
  
  googleReviewRouting: {
    offered: boolean;
    reason: 
      | "rating_5_always" 
      | "positive_3_4_routed" 
      | "quota_exceeded" 
      | "low_positive_score" 
      | "negative_withheld" 
      | "disabled";
    offerShownAt?: string;
    clickedAt?: string;
  };
  
  customerContact?: {
    name?: string;
    email?: string;
    phone?: string;
    wantsContactRequested: boolean;
    consentGiven: boolean;
  };
  
  caseId?: string;
  loyaltyAccountId?: string;
  
  sessionMetadata: {
    durationSeconds: number;
    userAgentTruncated?: string;
    deviceType: "mobile" | "tablet" | "desktop";
    ipHashAnonymized: string;
  };
  
  createdAt: string;
}

export interface GoogleReviewRoutingCounter {
  id: string; // `${tenantId}_${branchId}_${YYYY}-${MM}`
  tenantId: string;
  branchId: string;
  year: number;
  month: number;
  positive34Routed: number;
  lastUpdatedAt: string;
}

export type CaseStatus = "new" | "reviewing" | "contacted" | "compensation_sent" | "resolved" | "closed";
export type CaseSeverity = "low" | "medium" | "high" | "critical";

export interface Case {
  id: string;
  tenantId: string;
  branchId: string;
  feedbackResponseId: string;
  employeeId?: string;
  
  status: CaseStatus;
  severity: CaseSeverity;
  assignedToUserId?: string;
  assignedToName?: string;
  
  customerName?: string;
  customerContact?: string;
  customerConsent: boolean;
  
  slaDeadline: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  
  internalNotes: string;
  compensationId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface CaseEvent {
  id: string;
  caseId: string;
  tenantId: string;
  performedByUserId: string;
  performedByName: string;
  eventType: "status_changed" | "note_added" | "assigned" | "compensation_issued" | "customer_contacted";
  details: string;
  createdAt: string;
}

export type CompensationType = "coupon" | "discount_percent" | "free_item" | "credit_amount" | "custom_gift";
export type CompensationStatus = "generated" | "sent" | "redeemed" | "expired";

export interface Compensation {
  id: string;
  tenantId: string;
  caseId?: string;
  customerId?: string;
  code: string;
  type: CompensationType;
  valueDescription: string;
  valueNumber?: number;
  status: CompensationStatus;
  validUntil: string;
  redeemedAt?: string;
  redeemedAtBranchId?: string;
  redeemedByEmployeeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name?: string;
  email?: string;
  phone?: string;
  loyaltyAccountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyAccount {
  id: string;
  tenantId: string;
  customerId: string;
  currentBalance: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  totalVisits: number;
  totalPointsEarnedLifetime: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export type PointsTransactionType = "earn" | "redeem" | "adjustment" | "expiration" | "refund";

export interface PointsLedgerEntry {
  id: string;
  tenantId: string;
  loyaltyAccountId: string;
  customerId: string;
  type: PointsTransactionType;
  points: number;
  reason: "survey_completion" | "branch_visit" | "reward_redemption" | "manual_adjustment" | "expiry_period";
  referenceId?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  imageUrl?: string;
  pointsRequired: number;
  isActive: boolean;
  validBranchIds?: string[];
  termsAndConditions: string;
  stockLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Redemption {
  id: string;
  tenantId: string;
  rewardId: string;
  loyaltyAccountId: string;
  customerId: string;
  redemptionCode: string;
  status: "pending_claim" | "claimed" | "cancelled" | "expired";
  claimedAt?: string;
  claimedAtBranchId?: string;
  verifiedByEmployeeId?: string;
  createdAt: string;
}

export interface AlertRule {
  id: string;
  tenantId: string;
  name: string;
  condition: 
    | "rating_less_equal_2" 
    | "keyword_flagged" 
    | "employee_rating_below" 
    | "negative_spike_hourly";
  parameters: Record<string, any>;
  channels: Array<"whatsapp" | "email" | "in_app">;
  targetRecipients: string[];
  isActive: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  userId?: string;
  title: string;
  body: string;
  type: "critical_feedback" | "sla_warning" | "case_assigned" | "milestone_reached";
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  tenantId: string;
  scope: { branchId?: string; timeframe: "day" | "week" | "month" };
  headline: string;
  summary: string;
  rootCauses: Array<{ issue: string; occurrences: number; recommendation: string }>;
  topPerformers: string[];
  areasOfConcern: string[];
  suggestedActions: string[];
  generatedAt: string;
}
