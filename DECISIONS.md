# Registro de Decisiones de Arquitectura (ADR) - ValoraCX

Este documento recopila las decisiones técnicas y de diseño fundamentales tomadas para la plataforma ValoraCX.

---

## ADR 001: Nombre de Marca y Posicionamiento Original
- **Fecha:** 2026-10-20
- **Decisión:** Nombrar la plataforma **ValoraCX** (*Valor y Experiencia del Cliente*), con identidad visual minimalista y profesional en tonos azul pizarra oscuro (`slate-900`), acentos esmeralda/turquesa (`emerald-500`) y superficies limpias.
- **Razón:** Garantizar una identidad 100% original, diferenciada y profesional para negocios físicos en Iberoamérica y mercados globales, sin referencias ni elementos visuales de productos existentes.

---

## ADR 002: Next.js App Router + TypeScript + Tailwind CSS
- **Fecha:** 2026-10-20
- **Decisión:** Utilizar Next.js con App Router y TypeScript como framework full-stack principal.
- **Razón:** Permite renderizado del lado del servidor para landings ultrarrápidas de escaneo QR/NFC (<1s First Contentful Paint en móviles), Server Actions seguras para operaciones con credenciales y un sistema unificado de API Routes y UI reactiva.

---

## ADR 003: Arquitectura Multi-Tenant con Colecciones Planas y TenantId Obligatorio
- **Fecha:** 2026-10-20
- **Decisión:** Utilizar colecciones raíz con atributo indexado `tenantId` en Firestore en lugar de subcolecciones infinitamente anidadas.
- **Razón:** Facilita consultas compuestas transversales por fecha, sucursal, empleado y región dentro de un mismo tenant, sin complejidades de Collection Group Queries costosas, manteniendo aislamiento hermético mediante reglas de seguridad.

---

## ADR 004: Enrutamiento Ético y Riguroso a Google Reviews (`ReviewRoutingService`)
- **Fecha:** 2026-10-20
- **Decisión:**
  1. La opinión interna siempre se registra y nunca se altera.
  2. Opiniones de 5 estrellas siempre reciben la invitación opcional y neutral a Google.
  3. Opiniones de 3 y 4 estrellas pasan por un filtro estricto de elegibilidad (`positiveScore >= 75` + `sentiment === POSITIVE`) y consumen un contador unificado mensual por sucursal con límite máximo de 2 por mes (`MAX_GOOGLE_ROUTED_3_4_PER_MONTH = 2`).
  4. Opiniones de 1 y 2 estrellas quedan exclusivamente en el sistema interno para activar recuperación inmediata (creación de caso y alerta).
  5. Se registran de manera independiente los eventos `google_review_offer_shown` y `google_review_link_clicked`. Nunca se infiere `published` sin confirmación oficial de API.
- **Razón:** Cumplir las directrices estrictas de políticas de reseñas, proteger la reputación del comercio y mantener la autenticidad del feedback interno sin sesgar las métricas operativas.

---

## ADR 005: Contabilidad Inmutable de Puntos de Fidelización (`pointsLedger`)
- **Fecha:** 2026-10-20
- **Decisión:** Toda acumulación, canje o ajuste de puntos en el módulo de Loyalty debe quedar registrada como una transacción individual e inmutable en `pointsLedger`.
- **Razón:** Evita discrepancias contables, permite auditoría exacta de transacciones y previene fraudes o inconsistencias de concurrencia.

---

## ADR 006: Patrón Ports & Adapters (Mocks Funcionales Autónomos)
- **Fecha:** 2026-10-20
- **Decisión:** Encapsular servicios externos (WhatsApp Cloud API, Gemini AI, Wallet PassKit, Google Business Profile) tras contratos de interfaz que cuentan con un proveedor `Live` y un proveedor `Mock` completamente funcional.
- **Razón:** Permite el desarrollo, prueba y demostración completa del sistema sin bloquearse por ausencia inicial de API keys o costos imprevistos de servicios de terceros.
