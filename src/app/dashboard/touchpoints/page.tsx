"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { DataStore } from "@/lib/data/store";
import { useAuth } from "@/context/AuthContext";
import { Touchpoint, TouchpointType } from "@/types";
import { generateSecureToken } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  QrCode, Plus, Download, Copy, RefreshCw, 
  Trash2, ExternalLink, Check, Smartphone, Radio, UserCheck, MapPin
} from "lucide-react";

export default function TouchpointsPage() {
  const { selectedBranchId, branches, employees } = useAuth();
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([]);
  const [qrModalItem, setQrModalItem] = useState<Touchpoint | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Touchpoint Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<TouchpointType>("employee_card");
  const [newBranchId, setNewBranchId] = useState("");
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newTableNumber, setNewTableNumber] = useState("");

  const loadData = () => {
    const list = DataStore.getTouchpoints(selectedBranchId === "all" ? undefined : selectedBranchId);
    setTouchpoints([...list]);
  };

  useEffect(() => {
    loadData();
    if (branches.length > 0 && !newBranchId) {
      setNewBranchId(branches[0].id);
    }
  }, [selectedBranchId, branches]);

  // Generate QR Code for modal
  useEffect(() => {
    if (qrModalItem) {
      const fullUrl = `${window.location.origin}/f/${qrModalItem.secureToken}`;
      QRCode.toDataURL(fullUrl, { width: 300, margin: 2 }, (err, url) => {
        if (!err) setQrDataUrl(url);
      });
    } else {
      setQrDataUrl("");
    }
  }, [qrModalItem]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBranchId) return;

    const token = generateSecureToken("tk_");
    const domain = typeof window !== "undefined" ? window.location.origin : "https://valoracx.app";

    DataStore.addTouchpoint({
      tenantId: "ten_restaurante_demo",
      branchId: newBranchId,
      name: newName.trim(),
      type: newType,
      secureToken: token,
      publicUrl: `/f/${token}`,
      nfcPayloadUrl: `${domain}/f/${token}`,
      assignedEmployeeId: newEmployeeId || undefined,
      tableNumber: newTableNumber || undefined,
      isActive: true,
    });

    setIsCreating(false);
    setNewName("");
    setNewTableNumber("");
    setNewEmployeeId("");
    loadData();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = (name: string) => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_${name.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const handleRevoke = (tp: Touchpoint) => {
    if (confirm(`¿Deseas revocar y regenerar el token de "${tp.name}"? Los códigos QR y tarjetas NFC impresas anteriores dejarán de funcionar.`)) {
      tp.secureToken = generateSecureToken("tk_");
      const domain = typeof window !== "undefined" ? window.location.origin : "https://valoracx.app";
      tp.publicUrl = `/f/${tp.secureToken}`;
      tp.nfcPayloadUrl = `${domain}/f/${tp.secureToken}`;
      tp.updatedAt = new Date().toISOString();
      loadData();
    }
  };

  const handleToggleActive = (tp: Touchpoint) => {
    tp.isActive = !tp.isActive;
    tp.updatedAt = new Date().toISOString();
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Puntos de Contacto (NFC & QR)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra tarjetas de empleados, stickers para mesas y displays de mostrador con tokens seguros.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Punto de Contacto</span>
        </Button>
      </div>

      {/* Modal / Formulario de Creación */}
      {isCreating && (
        <Card className="border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Crear Nuevo Punto de Contacto</CardTitle>
            <CardDescription>Genera un token seguro y enlace NFC listo para utilizarse.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Tarjeta Carlos R. o Mesa 15"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tipo de Punto</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TouchpointType)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                >
                  <option value="employee_card">Tarjeta NFC de Colaborador</option>
                  <option value="table_sticker">Sticker QR para Mesa</option>
                  <option value="counter_sign">Acrílico Mostrador / Caja</option>
                  <option value="packaging">Empaque / Delivery</option>
                  <option value="receipt">Ticket / Factura</option>
                  <option value="whatsapp">Enlace WhatsApp</option>
                  <option value="general_qr">QR General de Sucursal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Sucursal</label>
                <select
                  value={newBranchId}
                  onChange={(e) => setNewBranchId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {newType === "employee_card" && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Colaborador Asignado</label>
                  <select
                    value={newEmployeeId}
                    onChange={(e) => setNewEmployeeId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                  >
                    <option value="">Selecciona colaborador...</option>
                    {employees.filter(e => !newBranchId || e.branchId === newBranchId).map(e => (
                      <option key={e.id} value={e.id}>{e.displayName} - {e.position}</option>
                    ))}
                  </select>
                </div>
              )}

              {newType === "table_sticker" && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Número de Mesa / Zona</label>
                  <input
                    type="text"
                    placeholder="ej: Mesa 08 Terraza"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
                  />
                </div>
              )}

              <div className="flex items-end gap-2">
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Generar Punto
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grid de Touchpoints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {touchpoints.map((tp) => {
          const branch = branches.find(b => b.id === tp.branchId);
          const employee = employees.find(e => e.id === tp.assignedEmployeeId);
          const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${tp.secureToken}` : tp.publicUrl;

          return (
            <Card key={tp.id} className="relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-700 transition">
              <div className={`h-1.5 w-full ${tp.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{tp.name}</span>
                      <Badge variant={tp.isActive ? "success" : "secondary"}>
                        {tp.isActive ? "Activo" : "Pausado"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{branch?.name || "Sin sucursal"}</span>
                    </CardDescription>
                  </div>

                  <button
                    onClick={() => setQrModalItem(tp)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                    title="Ver Código QR"
                  >
                    <QrCode className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                {employee && (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{employee.displayName}</p>
                      <p className="text-[11px] text-slate-400">{employee.position}</p>
                    </div>
                  </div>
                )}

                {/* Métricas del Touchpoint */}
                <div className="grid grid-cols-2 gap-2 text-center py-1">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Escaneos</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{tp.stats.scansCount}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Completadas</span>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{tp.stats.completedSurveysCount}</p>
                  </div>
                </div>

                {/* NFC Payload URL */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    URL NFC / Web Segura:
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      readOnly
                      value={fullUrl}
                      className="bg-transparent flex-1 text-[11px] text-slate-600 dark:text-slate-300 font-mono outline-none truncate"
                    />
                    <button
                      onClick={() => handleCopy(fullUrl, tp.id)}
                      className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500"
                      title="Copiar URL"
                    >
                      {copiedId === tp.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={`/f/${tp.secureToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500"
                      title="Abrir Encuesta"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(tp)}
                    className="text-[11px] h-7 px-2 flex items-center gap-1"
                    title="Regenera el token si la tarjeta se extravió"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Regenerar</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(tp)}
                    className="text-[11px] h-7 px-2"
                  >
                    {tp.isActive ? "Pausar" : "Activar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Previsualización y Descarga QR */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              {qrModalItem.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Código QR de alta definición listo para impresión física o soporte acrílico.
            </p>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block mb-4 shadow-inner">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR Code" className="h-56 w-56 mx-auto" />
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleDownloadQr(qrModalItem.name)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Download className="h-4 w-4" />
                <span>Descargar PNG para Impresión</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setQrModalItem(null)}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
