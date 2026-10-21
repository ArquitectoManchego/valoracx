// src/lib/constants.ts

export const SECTORS = [
  { id: "retail", name: "Uniformes & Confección Textil", icon: "ShoppingBag" },
  { id: "medical_uniforms", name: "Uniformes Médicos & Clínicos", icon: "Activity" },
  { id: "school_uniforms", name: "Uniformes Escolares & Colegiales", icon: "GraduationCap" },
  { id: "industrial_uniforms", name: "Uniformes Industriales & Seguridad", icon: "ShieldCheck" },
  { id: "restaurant", name: "Restaurante & Alimentos", icon: "Utensils" },
  { id: "services", name: "Servicios Profesionales", icon: "Briefcase" },
  { id: "other", name: "Otro Negocio Físico", icon: "Store" },
] as const;

export const DEFAULT_SURVEY_CATEGORIES = [
  { id: "servicio", label: "Atención del Asesor", icon: "UserCheck" },
  { id: "calidad", label: "Calidad de Prenda y Telas", icon: "Sparkles" },
  { id: "bordados", label: "Bordados y Acabados", icon: "Scissors" },
  { id: "tallas", label: "Ajuste y Variedad de Tallas", icon: "ShoppingBag" },
  { id: "rapidez", label: "Tiempo de Entrega", icon: "Clock" },
  { id: "precio_calidad", label: "Relación Calidad/Precio", icon: "Tag" },
];

export const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin de Plataforma",
  owner: "Propietario / Dueño",
  corporate_admin: "Administrador Corporativo",
  regional_manager: "Gerente Regional",
  branch_manager: "Gerente de Tienda",
  supervisor: "Supervisor de Mostrador / Taller",
  employee: "Asesor / Colaborador",
  analyst: "Analista (Solo Lectura)",
};

export const CASE_STATUS_CONFIG = {
  new: { label: "Nuevo", badgeClass: "bg-red-500/10 text-red-500 border-red-500/20" },
  reviewing: { label: "En Revisión", badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  contacted: { label: "Contactado", badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  compensation_sent: { label: "Compensación Enviada", badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  resolved: { label: "Resuelto", badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  closed: { label: "Cerrado", badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
};
