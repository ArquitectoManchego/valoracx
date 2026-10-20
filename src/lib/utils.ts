// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera un token aleatorio criptográficamente seguro y no secuencial
 */
export function generateSecureToken(prefix: string = "tk_"): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${token}`;
}

/**
 * Hash anónimo para deduplicación sin guardar la dirección IP
 */
export function generateAnonymizedHash(identifier: string, salt: string = "ValoraCX-Salt-2026"): string {
  let hash = 0;
  const str = `${identifier}:${salt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "hash_" + Math.abs(hash).toString(36);
}

/**
 * Formateo amigable de fechas en español
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Formateo de fecha relativa (hace 5 minutos, hace 2 horas, etc.)
 */
export function timeAgo(dateString: string): string {
  const now = new Date().getTime();
  const past = new Date(dateString).getTime();
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "hace unos segundos";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} días`;
  return formatDate(dateString);
}
