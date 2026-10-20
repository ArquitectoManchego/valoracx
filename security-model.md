# Modelo de Seguridad y Privacidad: ValoraCX

Este documento establece las políticas y mecanismos de seguridad, control de acceso basado en roles (RBAC), reglas de Firestore y protección de privacidad para la plataforma SaaS multi-tenant ValoraCX.

---

## 1. Matriz de Roles y Permisos (RBAC)

Los roles se definen a nivel de membresía (`memberships`) vinculada a cada `tenantId`:

| Rol | Ámbito | Feedback & Métricas | Gestión de Casos | Configuración / Sucursales | Fidelización & Recompensas | SuperAdmin SaaS |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Platform SuperAdmin** | Plataforma Global | Ver todo (soporte) | Ver todo | Ver / Modificar Planes | Ver todo | Control Total |
| **Owner (Propietario)** | Todo el Tenant | Control Total | Control Total | Control Total | Control Total | No |
| **Corporate Admin** | Todo el Tenant | Control Total | Control Total | Crear/Editar Sucursales/Personal | Control Total | No |
| **Regional Manager** | Sucursales asignadas | Ver/Exportar | Asignar y Resolver | Editar sucursales asignadas | Ver/Crear | No |
| **Branch Manager** | Sucursal específica | Ver/Exportar sucursal | Asignar y Resolver | Gestionar empleados/QRs | Canjear/Ver | No |
| **Supervisor** | Sucursal / Turno | Ver sucursal | Ver / Resolver asignados | Ver datos operativos | Validar canjes | No |
| **Employee (Colaborador)** | Personal (su ID) | Solo sus métricas | No | No | No | No |
| **Analyst (Solo Lectura)** | Todo el Tenant | Lectura / Exportar | Solo lectura | Solo lectura | Solo lectura | No |

---

## 2. Aislamiento Multi-Tenant en Firestore

Cada lectura o escritura en Firestore se valida contra el `tenantId` inyectado en el Custom Claim o verificado en el documento de `memberships`.

### Principio de Regla Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar: Usuario autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función auxiliar: Superadmin de la plataforma
    function isSuperAdmin() {
      return isAuthenticated() && request.auth.token.isPlatformSuperAdmin == true;
    }
    
    // Función auxiliar: Membresía activa en el tenant
    function hasTenantMembership(tenantId) {
      return isSuperAdmin() || (
        isAuthenticated() && 
        exists(/databases/$(database)/documents/memberships/$(request.auth.uid + '_' + tenantId))
      );
    }
    
    // Colección pública para resolución de tokens de encuesta (Lectura anónima)
    match /touchpoints/{touchpointId} {
      // Clientes pueden leer solo el touchpoint activo para cargar la encuesta pública
      allow read: if true;
      allow write: if hasTenantMembership(resource.data.tenantId);
    }
    
    // Colección de respuestas de feedback:
    // Los clientes pueden crear nuevas respuestas anónimas con validación de esquema
    match /feedbackResponses/{responseId} {
      allow create: if request.resource.data.rating >= 1 && 
                       request.resource.data.rating <= 5 &&
                       request.resource.data.tenantId is string;
      allow read, update, delete: if hasTenantMembership(resource.data.tenantId);
    }
    
    // Entidades protegidas por tenant
    match /{collectionName}/{docId} {
      allow read, write: if (
        collectionName in ['branches', 'employees', 'cases', 'compensations', 'rewards', 'pointsLedger', 'alerts', 'aiInsights'] &&
        hasTenantMembership(resource.data.tenantId)
      ) || isSuperAdmin();
    }
  }
}
```

---

## 3. Seguridad en la Captura de Feedback (Cliente Anónimo)

1. **Tokens Seguros Criptográficos:**
   - La URL de encuesta usa la estructura `/f/{secureToken}`.
   - El token es una cadena alfanumérica de 24+ caracteres con entropía criptográfica (`nanoid(24)` o `crypto.randomBytes(18)`).
   - Nunca se exponen IDs internos de Firestore ni números autoincrementales en URLs.
   - Los tokens pueden ser revocados, pausados o regenerados por el administrador en cualquier momento con efecto inmediato.

2. **Protección Anti-Abuso y Rate Limiting:**
   - **Honeypot:** Campo oculto en el formulario (`website_url`). Si contiene valor, la solicitud se descarta silenciosamente.
   - **Deduplicación Segura:** No se almacena la dirección IP del cliente. En su lugar se calcula un hash con salt diario:
     `ipHashAnonymized = SHA-256(ClientIP + SaltDelDía + TouchpointId)`.
     Esto previene spam o ataques de clics sin violar normativas de privacidad (GDPR / LFPDPPP).
   - **Ventana de Enfriamiento:** Se descartan ráfagas masivas que provengan del mismo hash en lapsos menores a 30 segundos.

3. **Consentimiento Explícito:**
   - Toda encuesta es 100% anónima por defecto.
   - Solo si el cliente solicita explícitamente ser contactado (ej. ante una mala experiencia) o desea afiliarse al programa de puntos, se presentan campos de contacto (Nombre, WhatsApp o Email) con casilla de consentimiento clara e inequívoca.

---

## 4. Seguridad de Integraciones y API Keys

1. **Variables de Entorno Server-Side:**
   - Tokens de WhatsApp Cloud API, Gemini API, credenciales de Google Service Account y llaves de Wallet Pass se ejecutan estrictamente en el entorno del servidor (Server Actions / Cloud Functions).
   - Ninguna clave privada o secreto de API se expone al bundle del cliente.
2. **Capa Mock Segura:**
   - En caso de operar en modo demostración o desarrollo, las capas Mock generan respuestas realistas sin vulnerar llamadas ni generar costos externos imprevistos.

---

## 5. Auditoría y Logs (`auditLogs`)
Operaciones críticas (cambio de roles, eliminación de sucursales, canje de recompensas, revocación de tokens) generan un registro inmutable en `auditLogs` con:
- `actorId` / `actorEmail`
- `tenantId`
- `action` (ej: "REVOKE_TOUCHPOINT_TOKEN")
- `targetEntityId`
- `ipAddress`
- `timestamp`
