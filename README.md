# ITESA-CIS — Especificación del Sistema

Sistema integral para la gestión y administración de ferias, desarrollado para ITESA. Este proyecto utiliza una arquitectura separada de Frontend y Backend.

---

## Tabla de Contenidos

1. [Stack Tecnológico](#stack-tecnológico)
2. [Esquema de la Base de Datos](#esquema-de-la-base-de-datos)
3. [Autenticación y Gestión de Sesiones](#autenticación-y-gestión-de-sesiones)
4. [Roles y Permisos](#roles-y-permisos)
5. [Endpoints de la API](#endpoints-de-la-api)
6. [Lógica de Evaluación](#lógica-de-evaluación)
7. [Sistema de Alertas](#sistema-de-alertas)
8. [Características Principales](#características-principales)
9. [Navegación y Rutas](#navegación-y-rutas)
10. [Manejo de Errores](#manejo-de-errores)
11. [Flujo de Trabajo](#flujo-de-trabajo)

---

## Stack Tecnológico

**Backend**
- Runtime: Node.js
- Framework: Express.js
- Base de Datos: PostgreSQL
- ORM: Prisma
- Autenticación: `jsonwebtoken` (JWT), `bcrypt`

**Frontend**
- Framework: React (TailwindCSS)
- Cliente HTTP: Axios
- Almacenamiento: `localStorage` (JWT + objeto de usuario)

---

## Esquema de la Base de Datos

```dbml
Project "ITESA-CIS" {
  database_type: "PostgreSQL"
}

enum user_roles {
  brackix
  user
}

TABLE users {
  id uuid [pk]
  username varchar [not null, unique]
  password_hash text [not null]
  role user_roles [not null, default: user_roles.user]
}

TABLE students {
  id uuid [pk]
  list_number int [not null]
  name varchar [not null]
  last_name varchar [not null]
  section char(1) [not null]
  image_url text
  alt_text text

  indexes {
    (list_number)
    (section)
    (name, last_name)
  }
}

TABLE groups {
  id uuid [pk]
  group_name varchar [not null]

  indexes {
    (group_name)
  }
}

TABLE groups_students {
  id uuid [pk]
  group_id uuid [not null]
  student_id uuid [not null]
  is_coordinator bool [default: false]

  indexes {
    (group_id, student_id) [unique]
  }
}

TABLE projects {
  id uuid [pk]
  name varchar [not null]
  description text
  group_id uuid [not null]
}

enum project_criterion_status {
  in_progress
  achieved
  not_achieved
  late
}

enum evaluation_phase {
  preparation
  fair
}

TABLE project_criteria {
  id uuid [pk]
  name varchar [not null]
  description text
}

TABLE project_criterion_evaluations {
  id uuid [pk]
  project_id uuid [not null]
  criterion_id uuid [not null]
  phase evaluation_phase [not null]
  start_date timestamp
  end_date timestamp
  status project_criterion_status [not null, default: project_criterion_status.in_progress]
  notes text
}

Ref: groups_students.student_id > students.id
Ref: groups_students.group_id > groups.id
Ref: projects.group_id > groups.id
Ref: project_criterion_evaluations.criterion_id > project_criteria.id
Ref: project_criterion_evaluations.project_id > projects.id
```

**Notas sobre el esquema**
- `section char(1)` almacena una sola letra (ej. `A`, `B`, `C`).
- Cada grupo tiene un solo proyecto.
- Un estudiante solo puede pertenecer a un grupo a la vez.
- Exactamente un estudiante por grupo debe ser el coordinador (`is_coordinator = true`).

---

## Autenticación y Gestión de Sesiones

### Flujo de Login
El frontend envía una petición POST a `/api/v1/auth/login` con `username` y `password`. El backend verifica las credenciales y devuelve un JWT y el objeto de usuario. El frontend los almacena en `localStorage` (`itesa_token` e `itesa_user`).

### JWT
- **Payload**: `{ sub: user.id, username, role, iat, exp }`
- **Expiración**: 8 horas.
- **Secreto**: Variable de entorno `JWT_SECRET`.

### Middleware de Autenticación
El middleware `verifyToken` valida el JWT en cada ruta protegida. `requireRole('brackix')` se usa para rutas administrativas.

---

## Roles y Permisos

| Recurso | `user` | `brackix` |
|---|---|---|
| Dashboard | Leer | Leer |
| Estudiantes | Leer, Escribir | Leer, Escribir |
| Grupos | Leer, Escribir | Leer, Escribir |
| Proyectos | Leer, Escribir | Leer, Escribir |
| Criterios | Leer, Escribir | Leer, Escribir |
| Evaluaciones | Leer, Escribir | Leer, Escribir |
| Usuarios | — | Leer, Escribir |

---

## Endpoints de la API

Prefijo: `/api/v1`. Todas las respuestas son JSON.

### Autenticación
- `POST /auth/login`: Autenticar usuario.
- `GET /auth/me`: Verificar token y devolver usuario actual.

### Resumen de Recursos
Se exponen servicios para la gestión de alumnos, grupos, proyectos y evaluaciones.
- **Usuarios**: Gestión de cuentas (Solo administradores).
- **Estudiantes**: Listado y búsqueda por sección.
- **Grupos**: Gestión de miembros y asignación de coordinadores.
- **Proyectos**: Definición de proyectos vinculados a grupos.
- **Evaluaciones**: Seguimiento de criterios en fases de preparación y feria.

---

## Lógica de Evaluación

### Fases
Cada proyecto se evalúa en dos etapas:
- `preparation`: Fase de construcción.
- `fair`: Presentación final.

### Transiciones de Estado
El sistema gestiona automáticamente los estados `in_progress`, `achieved`, `not_achieved` y `late` basándose en las fechas límite (`end_date`). Un proceso en segundo plano marca como no logradas las evaluaciones vencidas cada hora.

---

## Sistema de Alertas

El sistema detecta automáticamente dos tipos de alertas para evaluaciones pendientes:
- **Vencidas (Rojo)**: Fecha límite superada.
- **En Riesgo (Ámbar)**: Fecha límite en las próximas 48 horas.

---

## Características Principales

- **Dashboard**: Panel de control con métricas generales y alertas críticas.
- **Gestión de Grupos**: Control de membresía y roles dentro de los equipos.
- **Seguimiento de Proyectos**: Matriz detallada de progreso por criterios y fases.
- **Alertas en Tiempo Real**: Notificaciones visuales sobre plazos próximos a vencer.
- **Seguridad Dinámica**: Control de acceso basado en roles (`user` y `brackix`).

---

## Navegación y Rutas

- `/dashboard`: Panel principal.
- `/students`: Alumnos.
- `/groups`: Grupos.
- `/projects`: Proyectos.
- `/criteria`: Criterios.
- `/evaluations`: Evaluaciones.
- `/users`: Usuarios (Solo admin).

---

## Manejo de Errores

El sistema utiliza códigos de estado HTTP estándar:
- `400 (VALIDATION_ERROR)`: Datos inválidos.
- `401 (UNAUTHORIZED)`: Sesión expirada o inválida.
- `403 (FORBIDDEN)`: Permiso insuficiente.
- `404 (NOT_FOUND)`: Recurso no encontrado.
- `409 (CONFLICT)`: Violación de integridad o duplicados.

---

## Flujo de Trabajo

1. El usuario inicia sesión y revisa las métricas y alertas en el **Dashboard**.
2. Gestiona los grupos y estudiantes asignados.
3. Define proyectos y realiza el seguimiento de criterios durante la preparación.
4. Actualiza estados y añade notas durante la evaluación final en la feria.
5. El sistema garantiza la integridad de los datos y alerta sobre plazos incumplidos automáticamente.