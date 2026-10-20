"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/constants";
import { RoleType } from "@/types";
import { 
  Building2, MapPin, Shield, Bell, QrCode, User, 
  ExternalLink, CheckCircle2, AlertTriangle 
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { DataStore } from "@/lib/data/store";

export function Navbar() {
  const { 
    currentRole, setRole, selectedBranchId, 
    setSelectedBranchId, branches, tenant 
  } = useAuth();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = DataStore.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roles: RoleType[] = [
    "owner",
    "branch_manager",
    "supervisor",
    "employee",
    "corporate_admin",
    "regional_manager",
    "analyst",
    "superadmin",
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:bg-slate-900/95 dark:border-slate-800">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Tenant Info */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-emerald-500 shadow-md">
              <span className="font-bold text-lg tracking-wider">V</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">ValoraCX</span>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {tenant.name}
              </p>
            </div>
          </Link>

          {/* Branch Selector (Filtrado global) */}
          {currentRole !== "employee" && (
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <MapPin className="h-4 w-4 text-slate-500" />
              <select
                aria-label="Seleccionar sucursal"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-2"
              >
                <option value="all" className="dark:bg-slate-900">Todas las Sucursales (3)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-slate-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Controls & RBAC Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick survey simulation link */}
          <Link href="/f/tk_carlos_centro_01" target="_blank">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
              <QrCode className="h-3.5 w-3.5" />
              <span>Escanear QR Carlos</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>
          </Link>

          {/* Interactive RBAC Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] text-slate-500 hidden lg:inline font-medium">Rol activo:</span>
            <select
              aria-label="Cambiar rol activo"
              value={currentRole}
              onChange={(e) => setRole(e.target.value as RoleType)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="dark:bg-slate-900">
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
              title="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Alertas Operativas</span>
                  <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                    {unreadCount} nuevas
                  </Badge>
                </div>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    href="/dashboard/cases"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Ver bandeja de incidentes →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
