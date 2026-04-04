import { patchJsonEnvelope, unwrapEnvelope } from './client'
import type { SubscriptionDetail } from '@/pages/subscription/mockData'
import {
  DEMO_SUBSCRIPTION_ACTIVITY,
  enrichSubscriptionDetail,
  getSubscriptionById,
} from '@/pages/subscription/mockData'

/**
 * When the Nest API exposes subscriptions, set in `.env`:
 *   VITE_USE_SUBSCRIPTION_API=true
 * Endpoints: `GET` / `PATCH /api/v1/admin/subscriptions/:id` with `{ success, message, data }` envelopes.
 */
export type SubscriptionDetailWithLog = SubscriptionDetail & {
  activityLog: { date: string; activity: string }[]
}

/** Body for `PATCH /api/v1/admin/subscriptions/:id` (matches Nest `UpdateSubscriptionDto`). */
export type PatchSubscriptionBody = {
  adminName?: string
  facility?: string
  plan?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export async function patchSubscription(
  id: string,
  body: PatchSubscriptionBody,
): Promise<SubscriptionDetailWithLog> {
  const data = await patchJsonEnvelope<
    SubscriptionDetail & { activityLog?: { date: string; activity: string }[] },
    PatchSubscriptionBody
  >(`/admin/subscriptions/${id}`, body)
  const log =
    data.activityLog && data.activityLog.length > 0
      ? data.activityLog
      : DEMO_SUBSCRIPTION_ACTIVITY
  return {
    ...data,
    activityLog: log,
  }
}

export async function fetchSubscriptionDetail(
  id: string,
): Promise<SubscriptionDetailWithLog | null> {
  const useApi = import.meta.env.VITE_USE_SUBSCRIPTION_API === 'true'

  if (useApi) {
    try {
      const data = await unwrapEnvelope<
        SubscriptionDetail & { activityLog?: { date: string; activity: string }[] }
      >(`/admin/subscriptions/${id}`)
      const log =
        data.activityLog && data.activityLog.length > 0
          ? data.activityLog
          : DEMO_SUBSCRIPTION_ACTIVITY
      return {
        ...data,
        activityLog: log,
      }
    } catch {
      return null
    }
  }

  const row = getSubscriptionById(id)
  if (!row) return null
  const detail = enrichSubscriptionDetail(row)
  return {
    ...detail,
    activityLog: DEMO_SUBSCRIPTION_ACTIVITY,
  }
}
