# industrial-equipements

EquipFlow — equipment management demo (frontend MVP).

A **frontend-only**, production-shaped prototype for heavy equipment import & order operations: leads → orders → vendor import tracking (internal) → stock → pay-on-delivery.

## Tech stack

| Layer | Choice | Why |
|--------|--------|-----|
| Framework | **Next.js 15** (App Router) | SSR/API routes ready when you add a backend |
| Language | **TypeScript** | Domain types shared with future API |
| UI | **Tailwind CSS 4** + small component library | Minimal, responsive, professional |
| State (demo) | **Zustand** + `localStorage` | Interactive demo without a server |
| Icons | **Lucide** | Consistent iconography |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Modules

- **Dashboard** — KPIs and pipeline snapshot
- **Leads** — sources (cold call, social, referral), status pipeline, add lead
- **Orders** — line items, stock vs import, status updates
- **Import tracking** — internal vendor milestones (not customer-facing)
- **Stock** — spare inventory and book value
- **Payments** — pay after delivery / customer confirmation flow
- **Customers** — profile and order summary

## Scaling to a real backend

1. Replace `useAppStore` reads/writes with **fetch** or **TanStack Query** against REST/GraphQL.
2. Keep types in `src/types/domain.ts` as the contract.
3. Move seed data to API; add auth (e.g. NextAuth / Clerk) before production.
4. Optional: add `src/services/*.ts` repository interfaces — already mirrored by store actions.

## Demo data

Use **Reset demo data** in the sidebar to restore the seeded dataset.
# industrial-equipements
