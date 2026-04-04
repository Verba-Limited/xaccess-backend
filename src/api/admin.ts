import {
  deleteJsonEnvelope,
  patchJsonEnvelope,
  postJsonEnvelope,
  unwrapEnvelope,
} from './client'
import type {
  Community,
  CommunityAdminRow,
  PlatformSummary,
} from './types'

export function fetchPlatformSummary() {
  return unwrapEnvelope<PlatformSummary>('/admin/analytics/summary')
}

export function fetchCommunityAdmins() {
  return unwrapEnvelope<CommunityAdminRow[]>('/admin/community-admins')
}

export type CommunityAdminDetail = CommunityAdminRow & {
  activityLog: { date: string; activity: string }[]
}

export function fetchCommunityAdmin(id: string) {
  return unwrapEnvelope<CommunityAdminDetail>(`/admin/community-admins/${id}`)
}

export function createCommunityAdmin(body: {
  email: string
  password: string
  fullName: string
  communityId: string
  phone?: string
}) {
  return postJsonEnvelope<CommunityAdminRow, typeof body>(
    '/admin/community-admins',
    body,
  )
}

export function updateCommunityAdmin(
  id: string,
  body: Partial<{
    email: string
    password: string
    fullName: string
    communityId: string
    phone: string | null
    isActive: boolean
  }>,
) {
  return patchJsonEnvelope<CommunityAdminRow, typeof body>(
    `/admin/community-admins/${id}`,
    body,
  )
}

export function deleteCommunityAdmin(id: string) {
  return deleteJsonEnvelope<{ ok: boolean }>(`/admin/community-admins/${id}`)
}

export function fetchCommunities() {
  return unwrapEnvelope<Community[]>('/communities')
}

export function createCommunity(body: {
  name: string
  slug: string
  address?: string
}) {
  return postJsonEnvelope<Community, typeof body>('/communities', body)
}
