/** Demo data until subscription APIs exist */

export type SubscriptionPlan = {
  id: string
  name: string
  monthlyPrice: number
  type: 'basic' | 'standard' | 'premium' | 'custom'
}

export type SubscriptionRow = {
  id: string
  adminName: string
  facility: string
  plan: string
  startDate: string
  endDate: string
  active: boolean
}

export type PaymentRow = {
  id: string
  adminName: string
  facility: string
  planLabel: string
  status: 'Active' | 'Inactive' | 'Expired'
  date: string
}

export const MOCK_PLANS: SubscriptionPlan[] = [
  { id: 'p1', name: 'Basic Plan', monthlyPrice: 10, type: 'basic' },
  { id: 'p2', name: 'Standard Plan', monthlyPrice: 20, type: 'standard' },
  { id: 'p3', name: 'Premium Plan', monthlyPrice: 30, type: 'premium' },
]

export const SUBSCRIPTION_STATS = {
  total: 1000,
  active: 950,
  inactive: 50,
}

export const ALERTS = {
  upcomingExpirations: 10,
  paymentFailures: 2,
  successfulPayments: 128,
}

export const MOCK_SUBSCRIPTIONS: SubscriptionRow[] = Array.from({ length: 40 }, (_, i) => ({
  id: `sub-${i + 1}`,
  adminName: i % 3 === 0 ? 'Rokeeb Abdul' : `Admin ${i + 1}`,
  facility: i % 2 === 0 ? 'Facility A' : 'Facility B',
  plan: ['Basic Plan', 'Standard Plan', 'Premium Plan'][i % 3] ?? 'Basic Plan',
  startDate: '2024-01-01',
  endDate: '2025-01-01',
  active: i % 7 !== 0,
}))

export const MOCK_PAYMENTS: PaymentRow[] = Array.from({ length: 40 }, (_, i) => ({
  id: `pay-${i + 1}`,
  adminName: 'Rokeeb Abdul',
  facility: 'Facility A',
  planLabel: 'Basic Plan',
  status: (['Active', 'Inactive', 'Expired'] as const)[i % 3] ?? 'Active',
  date: '2024-01-01',
}))

/** Resolved row for detail screen (mock enrichment until API exists). */
export type SubscriptionDetail = SubscriptionRow & {
  adminEmail: string
  monthlyAmount: number
  currency: string
}

export function getSubscriptionById(id: string): SubscriptionRow | undefined {
  return MOCK_SUBSCRIPTIONS.find((s) => s.id === id)
}

export function enrichSubscriptionDetail(row: SubscriptionRow): SubscriptionDetail {
  const plan = MOCK_PLANS.find((p) => p.name === row.plan)
  const slug = row.adminName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')
  return {
    ...row,
    adminEmail: `${slug || 'user'}@example.com`,
    monthlyAmount: plan?.monthlyPrice ?? 0,
    currency: 'USD',
  }
}

export const DEMO_SUBSCRIPTION_ACTIVITY: { date: string; activity: string }[] = [
  { date: '01/05/2024', activity: 'Subscription renewed for current period' },
  { date: '15/04/2024', activity: 'Payment method updated' },
  { date: '01/01/2024', activity: 'Plan upgraded from Basic to current plan' },
]
