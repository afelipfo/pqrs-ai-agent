# Sistema de Gestión PQRS con IA - Medellín

Un sistema inteligente de gestión de Peticiones, Quejas, Reclamos y Sugerencias (PQRS) para la Secretaría de Infraestructura Física de Medellín, Colombia. Utiliza inteligencia artificial para asignar automáticamente recursos y personal según la ubicación geográfica y disponibilidad.

## 🚀 Características Principales

### 📍 Gestión de Zonas
- **Administración de zonas y distritos** de Medellín
- **Coordenadas geográficas** para cada zona
- **Niveles de prioridad** (Baja, Media, Alta, Crítica)
- **Información demográfica** y área

### 🧠 Panel de Asignaciones Inteligentes
- **Asignación automática con IA** de personal y vehículos
- **Dashboard en tiempo real** del estado del sistema
- **Optimización basada en**:
  - Ubicación geográfica
  - Disponibilidad de recursos
  - Nivel de prioridad
  - Tipo de solicitud

### 📄 Gestión PQRS
- **Registro completo** de peticiones, quejas, reclamos y sugerencias
- **Clasificación automática** por categoría y prioridad
- **Seguimiento del estado** de cada solicitud
- **Información del ciudadano** integrada

### 👥 Gestión de Personal
- **Administración de empleados** con roles específicos
- **Ubicación geográfica** en tiempo real
- **Turnos y horarios** de trabajo
- **Certificaciones y especialidades**

### 🚗 Gestión de Vehículos
- **Flota vehicular** con tracking GPS
- **Estados de vehículos** (Disponible, Asignado, Mantenimiento)
- **Información de combustible** y mantenimiento
- **Tipos de vehículos** especializados

### 🗺️ Mapa Geográfico Interactivo
- **Visualización completa** de todos los recursos
- **Ubicación en tiempo real** de personal y vehículos
- **Zonas de cobertura** geográfica
- **PQRS geolocalizadas** en el mapa

### 📧 Sistema de Notificaciones
- **Notificaciones automáticas** por email
- **Alertas en tiempo real** para asignaciones
- **Información detallada** de cada solicitud
- **Sistema de respaldo** con notificaciones mock

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Radix UI** - Componentes accesibles
- **React Leaflet** - Mapas interactivos

### Backend & Base de Datos
- **Supabase** - Base de datos PostgreSQL con autenticación
- **Row Level Security (RLS)** - Seguridad a nivel de fila
- **Real-time subscriptions** - Actualizaciones en tiempo real

### IA & APIs
- **OpenAI API** - Motor de asignación inteligente
- **EmailJS** - Servicio de notificaciones por email
- **Leaflet** - Librería de mapas

## 📋 Requisitos del Sistema

- **Node.js** 18+
- **npm** o **pnpm**
- **Cuenta de Supabase**
- **Cuenta de OpenAI** (para IA)
- **Cuenta de EmailJS** (opcional, para notificaciones)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/afelipfo/pqrs-ai-agent.git
cd pqrs-ai-agent
```

### 2. Instalar dependencias
```bash
npm install
# o
pnpm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima

# EmailJS (Opcional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=tu_servicio_emailjs
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=tu_template_emailjs
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=tu_clave_publica_emailjs
```

### 4. Configurar base de datos
Ejecutar los scripts SQL en Supabase en este orden:
1. `scripts/001_create_core_tables.sql`
2. `scripts/002_insert_sample_data.sql`
3. `scripts/003_enable_rls.sql`
4. `scripts/004_add_coordinates.sql`

### 5. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📊 Estructura del Proyecto

```
pqrs-ai-agent/
├── app/                          # Páginas Next.js
│   ├── api/                      # Endpoints de API
│   ├── dashboard/                # Panel de asignaciones
│   ├── map/                      # Mapa geográfico
│   ├── personnel/                # Gestión de personal
│   ├── pqrs/                     # Gestión PQRS
│   ├── vehicles/                 # Gestión de vehículos
│   ├── zones/                    # Gestión de zonas
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página de inicio
├── components/                   # Componentes React
│   ├── ui/                       # Componentes de UI (Radix)
│   ├── assignment-dashboard.tsx  # Dashboard de asignaciones
│   ├── database-test.tsx         # Prueba de conexión DB
│   ├── geographical-map.tsx      # Componente de mapa
│   ├── personnel-management.tsx  # Gestión de personal
│   ├── pqrs-management.tsx       # Gestión PQRS
│   ├── vehicle-management.tsx    # Gestión de vehículos
│   └── zone-management.tsx       # Gestión de zonas
├── lib/                          # Utilidades y configuraciones
│   ├── ai-assignment-engine.ts   # Motor de IA
│   ├── notifications.ts          # Sistema de notificaciones
│   ├── supabase/                 # Configuración Supabase
│   └── utils.ts                  # Utilidades generales
├── hooks/                        # Hooks personalizados
├── public/                       # Archivos estáticos
├── scripts/                      # Scripts SQL
└── styles/                       # Estilos adicionales
```

## 🎨 Paleta de Colores

- **Azul Principal**: `#2563eb` - Para elementos principales
- **Naranja Secundario**: `#f59e0b` - Para acentos y acciones
- **Blanco**: `#ffffff` - Fondos y elementos claros
- **Gris**: `#6b7280` - Texto secundario

## 📱 Funcionalidades del Sistema

### Gestión de Zonas
- ✅ Crear, editar y eliminar zonas
- ✅ Asignar coordenadas geográficas
- ✅ Definir niveles de prioridad
- ✅ Información demográfica

### Panel de Asignaciones
- ✅ Dashboard con métricas en tiempo real
- ✅ Asignación automática con IA
- ✅ Visualización de recursos disponibles
- ✅ Historial de asignaciones

### Gestión PQRS
- ✅ Registro completo de solicitudes
- ✅ Clasificación por tipo y prioridad
- ✅ Seguimiento de estados
- ✅ Información del ciudadano

### Gestión de Personal
- ✅ Perfiles completos de empleados
- ✅ Roles y especialidades
- ✅ Ubicación geográfica
- ✅ Turnos y horarios

### Gestión de Vehículos
- ✅ Información completa de la flota
- ✅ Estados y mantenimiento
- ✅ Tracking GPS
- ✅ Tipos especializados

### Mapa Geográfico
- ✅ Visualización interactiva
- ✅ Capas de datos superpuestas
- ✅ Información detallada al hacer clic
- ✅ Navegación fluida

## 🔧 Configuración de Notificaciones

### EmailJS Setup (Recomendado)
1. Crear cuenta en [EmailJS](https://www.emailjs.com/)
2. Configurar servicio de email
3. Crear template de notificación
4. Obtener credenciales y configurar en `.env.local`

### Plantilla de Email Recomendada
```html
<!DOCTYPE html>
<html>
<body>
  <h2>Nueva Asignación PQRS</h2>
  <p>Hola {{personnel_name}},</p>
  <p>Se le ha asignado: {{pqrs_title}}</p>
  <p>Prioridad: {{pqrs_priority}}</p>
  <p>Zona: {{zone_name}}</p>
</body>
</html>
```

## 🧪 Pruebas del Sistema

### Prueba de Conexión
- Visitar la página principal
- Desplazarse hacia abajo hasta "Prueba de Conexión a Base de Datos"
- Hacer clic en "Ejecutar Prueba"
- Verificar que todas las tablas muestren ✅ OK

### Prueba de Funcionalidades
1. **Crear una zona** con coordenadas
2. **Crear personal** con ubicación
3. **Crear vehículo** con GPS
4. **Crear PQRS** con información completa
5. **Ver asignaciones** en el dashboard
6. **Visualizar datos** en el mapa

## 📈 Métricas y Estadísticas

El sistema proporciona métricas en tiempo real:
- **Total de PQRS** por estado
- **Personal disponible** vs asignado
- **Vehículos activos** por tipo
- **Zonas por prioridad**
- **Tiempo promedio** de resolución

## 🔒 Seguridad

- **Autenticación** con Supabase Auth
- **Row Level Security** en todas las tablas
- **Validación de datos** en frontend y backend
- **Encriptación** de datos sensibles

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otros Proveedores
- **Railway**
- **Render**
- **Heroku**
- **DigitalOcean App Platform**

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear issue en GitHub
- Revisar documentación en `EMAILJS_SETUP.md`
- Verificar logs de la aplicación

---

**Desarrollado para la Secretaría de Infraestructura Física de Medellín** 🏛️

*Sistema inteligente de gestión urbana con IA para optimizar recursos y mejorar la atención ciudadana.*