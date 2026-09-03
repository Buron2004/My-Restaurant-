# Restaurant Management System

Day 1 establishes the project architecture for the assessment.

## Structure

- `client/`: React + TypeScript + Vite frontend
- `server/`: Node.js + Express + TypeScript backend
- `server/prisma/`: PostgreSQL Prisma schema

Backend requests follow `routes -> controllers -> services -> repositories -> database`. Business logic belongs in services.

## Setup

```powershell
npm install
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Update `server/.env` with your PostgreSQL connection string and a private JWT secret.

## Run

Start both applications:

```powershell
npm run dev
```

Or run them separately with `npm run dev:client` and `npm run dev:server`.

The frontend runs at `http://localhost:5173` and the API at `http://localhost:3000`.

## Verify

```powershell
npm run build
Invoke-RestMethod http://localhost:3000/api/health
```

Expected health response:

```json
{"status":"ok","service":"restaurant-management-api"}
```
If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
