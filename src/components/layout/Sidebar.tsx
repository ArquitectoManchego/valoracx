"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, MessageSquareText, AlertCircle, Users, 
  Store, QrCode, Star, Gift, Sparkles, Settings, 
  BarChart3, ShieldCheck, TicketCheck, Wallet
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { currentRole } = useAuth();

  const isEmployeeOnly = currentRole === "employee";

  const navigation = isEmployeeOnly
    ? [
        { name: "Mi Desempeño", href: "/dashboard/employees", icon: Users },
        { name: "Mis Puntos de Contacto", href: "/dashboard/touchpoints", icon: QrCode },
      ]
    : [
        { name: "Dashboard General", href: "/dashboard", icon: LayoutDashboard },
        { name: "Feed de Opiniones", href: "/dashboard/feed", icon: MessageSquareText },
        { name: "Gestión de Incidentes", href: "/dashboard/cases", icon: AlertCircle },
        { name: "Colaboradores", href: "/dashboard/employees", icon: Users },
        { name: "Sucursales", href: "/dashboard/branches", icon: Store },
        { name: "Puntos NFC y QR", href: "/dashboard/touchpoints", icon: QrCode },
        { name: "Reputación & Google", href: "/dashboard/reputation", icon: Star },
        { name: "Compensaciones", href: "/dashboard/compensations", icon: TicketCheck },
        { name: "Fidelización & Loyalty", href: "/dashboard/loyalty", icon: Gift },
        { name: "IA & Pregúntale a tus Datos", href: "/dashboard/ai", icon: Sparkles },
        { name: "Reportes & Analítica", href: "/dashboard/reports", icon: BarChart3 },
        { name: "Configuración & Alertas", href: "/dashboard/settings", icon: Settings },
        ...(currentRole === "superadmin"
          ? [{ name: "SuperAdmin SaaS", href: "/dashboard/superadmin", icon: ShieldCheck }]
          : []),
      ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {isEmployeeOnly ? "Portal del Colaborador" : "Gestión Operativa"}
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-slate-900 text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/20 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-white dark:text-emerald-400" : "text-slate-500")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl p-3 bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 mb-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <Wallet className="h-4 w-4 text-emerald-500" />
          <span>Plan Professional</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
          Google Routing & IA activados. Multi-sucursal habilitado.
        </p>
      </div>
    </aside>
  );
}
