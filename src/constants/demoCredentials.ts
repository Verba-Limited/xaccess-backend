/**
 * Match `api/src/database/seed.service.ts` after `npm run start` with a fresh DB seed.
 * Enable visible hints in production demo builds with `VITE_SHOW_DEMO_LOGIN_HINT=true`.
 */
export const showDemoLoginHint =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGIN_HINT === 'true'

export const DEMO_SUPER_ADMIN = {
  email: 'superadmin@xaccess.local',
  password: 'SuperAdmin123!',
} as const

export const DEMO_FACILITY_ADMIN = {
  email: 'estate.admin@xaccess.local',
  password: 'EstateAdmin123!',
  /** Typical seeded community name — pick the matching facility in the dropdown */
  facilityName: 'Harmony Estate',
} as const
