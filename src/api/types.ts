export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type PublicUser = {
  id: string
  email: string
  fullName: string
  phone?: string | null
  unitLabel?: string | null
  role: string
  communityId: string | null
  isActive: boolean
  createdAt?: string
}

export type LoginResult = {
  accessToken: string
  user: PublicUser
}

export type PlatformSummary = {
  communityCount: number
  userCount: number
  communityAdminCount: number
  activeCommunityAdminCount: number
  inactiveCommunityAdminCount: number
  registeredHardwareDevices: number
  accessLogEntries: number
  generatedAt: string
}

export type CommunityAdminRow = {
  id: string
  fullName: string
  email: string
  phone: string
  facilityManaged: string
  location: string
  communityId: string | null
  isActive: boolean
  createdAt: string
}

export type Community = {
  id: string
  name: string
  slug: string
  isActive: boolean
  address: string | null
}
