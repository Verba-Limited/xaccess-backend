# Xaccess Web Admin (React)

Super-admin console aligned with the Figma screens in `../admin backend web design/`.  
- **Dashboard sidebar:** `public/logo-container.png` (from `admin backend web design/logo container.png`).

- **Login / register panels:** `public/logo.png` (full-width hero).

## Run

```bash
cd admin
npm install
npm run dev
# http://localhost:5173
```

Sign in with a **super admin** account (see root `README.md`), e.g. `superadmin@xaccess.local` / `SuperAdmin123!`.

## API

- **Dev (`npm run dev`):** default API base is **`/api/v1`** (relative), so the browser hits the Vite dev server and it **proxies** `/api` → `http://localhost:3000`. Keep the Nest API on port **3000**.
- **Production build:** set `VITE_API_URL` (e.g. `https://your-api.example.com/api/v1`) or it falls back to `http://localhost:3000/api/v1`.

If you see **`Cannot GET /api/v1/admin/...`**, the Nest process is missing that route: from `api/` run `npm run build && npm run start:dev` and confirm startup logs list `Mapped {/api/admin/community-admins, GET}`. See `../api/README.md` (Troubleshooting).

### Backend features used

- `POST /auth/login`, `GET /auth/me`
- `GET /admin/analytics/summary`
- `GET|POST|PATCH|DELETE /admin/community-admins` (community administrators)
- `GET` / `POST /communities` — **Communities** screen (`/communities`) lists estates and creates new ones (super admin)
- `GET /communities` (also used for facility dropdown when creating admins)

Charts on the dashboard use **illustrative demo data**; summary cards use live analytics where available.

### Subscription Management (UI)

Routes (demo data until APIs exist):

| Route | Screen |
|-------|--------|
| `/subscription` | List, donut chart, plans, alerts, subscription table |
| `/subscription/payment-overview` | Payment table with status pills |
| `/subscription/plans/create` | Create plan form |
| `/subscription/plans/:id/edit` | Edit plan form |
| `/subscription/subscriptions/:id` | Subscription detail (View) |
| `/subscription/subscriptions/:id/edit` | Edit subscription — calls `PATCH /api/v1/admin/subscriptions/:id` when API mode is on |

Set `VITE_USE_SUBSCRIPTION_API=true` when `GET` / `PATCH /api/v1/admin/subscriptions/:id` are available (see `src/api/subscriptions.ts`).

Design references: `../admin backend web design/Subscription Management*.png`.

### Communities (platform estates)

| Route | Screen |
|-------|--------|
| `/communities` | List active/inactive communities; **Create community** form (name, slug, address) — calls `POST /api/v1/communities` |

### Facility Overview (UI)

Routes (demo data + `sessionStorage` for newly created facilities):

| Route | Screen |
|-------|--------|
| `/facilities` | Stats cards, search, table (ID, name, location, status, admin), pagination, **Create Facility** |
| `/facilities/create` | Create facility form (details, admin info, credentials) |
| `/facilities/:id` | Facility information — sections + activity log |
| `/facilities/:id/edit` | Edit facility information (matches edit design) |

Design references: `../admin backend web design/Facility.png`, `Facility Details.png`, `Edit Facility Details.png`.

### Recent Activities (UI)

| Route | Screen |
|-------|--------|
| `/activity` | Back link, table (Date, Time, Admin Name, Facility, Activity Description), pagination |

Demo data (`src/pages/activity/mockData.ts`) until an audit log API exists.  
Design reference: `../admin backend web design/Recent Activities.png`.

### Confirmation modals

- **Logout** — `ConfirmLogoutModal` (`../admin backend web design/Logout Confirm.png`): opened from sidebar **Logout**; dark overlay, **Yes, Logout** / **Cancel**, bottom divider.
- **Delete** — `ConfirmDeleteModal` (`../admin backend web design/Delete Confirm.png`): used for destructive actions (subscriptions list, facilities, admin deactivate, etc.); **Yes, Delete** (red) / **Cancel** (brand).

## Build

```bash
npm run build
# output: dist/
```

## Stack

- Vite 8, React 19, TypeScript  
- Tailwind CSS 3, React Router 7, Recharts, Lucide icons  
