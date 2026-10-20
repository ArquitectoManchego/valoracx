import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ValoraCX - Inteligencia de Experiencia del Cliente y Reputación",
  description:
    "Plataforma SaaS multi-tenant para captura de feedback ultra-rápida, enrutamiento a Google Reviews, analítica de colaboradores, gestión de incidentes y fidelización.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
