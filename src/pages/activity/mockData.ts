/** Demo activity log rows until a backend feed exists */

export type ActivityRow = {
  id: string
  date: string
  time: string
  adminName: string
  facility: string
  description: string
}

const ADMINS = ['Rokeeb Abdul', 'Admin 2', 'Jane Smith', 'Facility Admin']
const FACILITIES = ['Facility A', 'Facility B', 'Lagos Estate', 'Facility Alpha']
const ACTIONS = [
  'Created new user account',
  'Updated subscription for Facility 1',
  'Payment received',
  'Deactivated user access',
  'Reset facility credentials',
  'Exported activity report',
]

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

const rest = Array.from({ length: 39 }, (_, i) => {
  const idx = i + 1
  const d = new Date(2024, 0, 1 + (idx % 28))
  const hour = 8 + (idx % 10)
  const min = (idx * 7) % 60
  return {
    id: `act-${idx + 1}`,
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(hour)}:${pad2(min)}`,
    adminName: ADMINS[idx % ADMINS.length] ?? 'Rokeeb Abdul',
    facility: FACILITIES[idx % FACILITIES.length] ?? 'Facility A',
    description: ACTIONS[idx % ACTIONS.length] ?? 'Activity',
  }
})

/** First row matches design sample; 39 more for pagination demo. */
export const MOCK_ACTIVITIES: ActivityRow[] = [
  {
    id: 'act-1',
    date: '2024-01-01',
    time: '14:30',
    adminName: 'Rokeeb Abdul',
    facility: 'Facility A',
    description: 'Created new user account',
  },
  ...rest,
]
