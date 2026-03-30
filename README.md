# ITESA CIS - Sistema de Administración

Sistema integral para la gestión y administración de ferias, desarrollado para ITESA. Este proyecto utiliza una arquitectura separada de Frontend y Backend.

## Estructura del Proyecto

El repositorio se divide en dos partes principales:

-   **/frontend**: Aplicación web construida con **Next.js 15+**.
-   **/backend**: API REST construida con **Node.js, Express y Prisma ORM**.

---

## Tecnologías Utilizadas

### Frontend
- **Framework:** Next.js (App Router y React 19)
- **UI Components:** PrimeReact
- **Estilos:** Tailwind CSS v4 + Framer Motion
- **Estado/Datos:** Zustand + React Query (TanStack)
- **Validación:** Zod + React Hook Form

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Herramientas:** Tsx (para desarrollo rápido)

---

## Configuración Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Brackix/itesa-cis.git
cd itesa-cis
```

### 2. Configurar el Backend
```bash
cd backend
npm install
cp .env.example .env
# Edita el archivo .env con tus credenciales de base de datos
npx prisma generate
npm run dev
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## Requisitos Previos

- **Node.js** (v18 o superior)
- **PostgreSQL** (en ejecución para el backend)
- **NPM** o **PNPM**

## Autor
- **Brackix** - *Desarrollo Inicial*
- Brackix tu ta loco e

