# ITESA-CIS — Especificación de Endpoints API (Backend)

## Prefijo base

```
/api/v1
```

---

# 🔐 AUTENTICACIÓN

### POST /auth/login

Autentica un usuario.

**Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "jwt",
  "user": { }
}
```

---

### GET /auth/me

Devuelve el usuario autenticado.

---

# 👤 USERS (Solo admin)

### GET /users

Lista todos los usuarios.

### GET /users/:id

Obtiene un usuario.

### POST /users

Crea un usuario.

### PUT /users/:id

Actualiza usuario.

### DELETE /users/:id

Elimina usuario.

**Reglas:**

* No eliminar el último admin
* No degradar tu propio rol

---

# 🎓 STUDENTS

### GET /students

Filtros:

```
?section=A&search=juan
```

### GET /students/:id

Obtiene estudiante.

### POST /students

Crea estudiante.

### PUT /students/:id

Actualiza estudiante.

### DELETE /students/:id

Elimina estudiante.

---

### GET /students/:id/details

Devuelve:

```json
{
  "student": {},
  "group": {},
  "role": "coordinator | member",
  "project": {},
  "progress": 75
}
```

---

# 👥 GROUPS

### GET /groups

Lista grupos.

### GET /groups/:id

Detalle de grupo.

### POST /groups

Crear grupo.

### PUT /groups/:id

Actualizar grupo.

### DELETE /groups/:id

Eliminar grupo.

---

## Operaciones especiales

### POST /groups/:id/students

Asigna estudiante a grupo.

```json
{
  "studentId": "uuid",
  "isCoordinator": false
}
```

---

### PATCH /groups/:id/coordinator

Define coordinador del grupo.

---

### DELETE /groups/:id/students/:studentId

Remueve estudiante del grupo.

---

# 📁 PROJECTS

### GET /projects

Lista proyectos.

### GET /projects/:id

Detalle.

### POST /projects

Crear proyecto.

### PUT /projects/:id

Actualizar.

### DELETE /projects/:id

Eliminar (cascade evaluaciones).

---

### GET /projects/:id/matrix

Devuelve matriz de evaluación:

```json
{
  "project": {},
  "group": {},
  "matrix": [
    {
      "criterion": "string",
      "preparation": {},
      "fair": {}
    }
  ]
}
```

---

# 📊 CRITERIA

### GET /criteria

Lista criterios.

### GET /criteria/:id

Detalle.

### POST /criteria

Crear.

### PUT /criteria/:id

Actualizar.

### DELETE /criteria/:id

Eliminar.

**Regla:**

* Si está en uso → 409 CONFLICT

---

# 📈 EVALUATIONS

### GET /evaluations

Filtros:

```
?projectId=&status=&phase=
```

### GET /evaluations/:id

Detalle.

### POST /evaluations

Crear.

### PUT /evaluations/:id

Actualizar completo.

### PATCH /evaluations/:id

Actualización parcial (status, notas, fechas).

### DELETE /evaluations/:id

Eliminar.

---

# 📊 DASHBOARD

### GET /dashboard

```json
{
  "metrics": {
    "groups": 0,
    "students": 0,
    "projects": 0,
    "achieved": 0,
    "in_progress": 0,
    "not_achieved": 0,
    "late": 0
  },
  "alerts": [],
  "risk": [],
  "progress": []
}
```

---

## Sub-endpoints

### GET /dashboard/alerts

Evaluaciones vencidas.

### GET /dashboard/risk

Evaluaciones próximas (<48h).

### GET /dashboard/progress

Progreso por grupo.

---

# ⚙️ REGLAS DE NEGOCIO

### 1. Un estudiante solo puede estar en un grupo

* Remover de grupo anterior antes de asignar

---

### 2. Un grupo solo tiene un proyecto

* Validar antes de crear

---

### 3. Coordinador único

* Solo un `is_coordinator = true` por grupo

---

### 4. Eliminaciones en cascada

* Proyecto → evaluaciones
* Estudiante → relación en grupo

---

### 5. Actualización automática de estados (CRON)

Cada hora:

* Si `end_date < now` y `status = in_progress`
  → cambiar a `not_achieved`

---

# 🧩 RESUMEN

## CRUD

* users
* students
* groups
* projects
* criteria
* evaluations

## Especiales

* /dashboard
* /projects/:id/matrix
* /students/:id/details
* /groups/:id/coordinator

---

# 🚀 NOTA FINAL

Este diseño cubre completamente:

* lógica de negocio
* vistas del frontend
* integridad de datos
* escalabilidad del backend

Listo para implementación directa en Express + Prisma.


ahi ta lo q dijo chagpitpi