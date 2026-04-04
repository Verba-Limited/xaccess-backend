export type PaymentHistoryRow = {
  id: string
  residentName: string
  apartment: string
  paymentDetails: string
  amount: string
  status: 'Successful' | 'Pending' | 'Failed'
  date: string
}

export type PaymentConfigRow = {
  id: string
  type: string
  amount: string
}

export type InvoicePlanRow = {
  id: string
  name: string
  serviceType: string
  amount: string
  category: string
  dueDate: string
  active: boolean
}

const STATUSES: PaymentHistoryRow['status'][] = ['Successful', 'Pending', 'Failed']

function buildPayments(): PaymentHistoryRow[] {
  const total = 40
  return Array.from({ length: total }, (_, i) => {
    const n = i + 1
    return {
      id: `pay-${n}`,
      residentName: n === 1 ? 'Rokeeb Abdul' : `Resident ${n}`,
      apartment: n === 1 ? 'Facility A,' : `Block ${(n % 5) + 1}`,
      paymentDetails: n % 3 === 0 ? 'Premium Plan' : 'Basic Plan',
      amount: 'N2,000,00',
      status: STATUSES[i % 3],
      date: '2024-01-01',
    }
  })
}

const PAYMENTS = buildPayments()

export function getPaymentHistoryRows(): PaymentHistoryRow[] {
  return PAYMENTS
}

export const PAYMENT_CONFIG_ROWS: PaymentConfigRow[] = [
  { id: 'plan-1', type: 'Service Charge', amount: '$10/month' },
]

const PLANS: InvoicePlanRow[] = Array.from({ length: 40 }, (_, i) => ({
  id: `plan-${i + 1}`,
  name: 'Service Charge',
  serviceType: 'Service Charge',
  amount: '$10/month',
  category: 'All Category',
  dueDate: '2024-01-01',
  active: i % 8 !== 7,
}))

export function getInvoicePlans(): InvoicePlanRow[] {
  return PLANS
}

export function getInvoicePlanById(id: string): InvoicePlanRow | undefined {
  return PLANS.find((p) => p.id === id)
}
