/** Demo facility data until backend APIs exist */

export type FacilityRow = {
  id: string
  idNo: string
  facilityName: string
  location: string
  status: 'active' | 'inactive'
  adminInCharge: string
}

export type FacilityDetail = FacilityRow & {
  email: string
  phone: string
  facilityAdmin: string
  registrationDate: string
  powerUsageKwh: number
  waterUsageLiters: number
  totalUsers: number
  subscriptionStatusLine: 'Active' | 'Inactive'
  adminName: string
  adminEmail: string
  adminPhone: string
  lastLogin: string
  subscriptionType: string
  subStartDate: string
  subEndDate: string
  paymentStatus: string
}

export const DEMO_FACILITY_ACTIVITY: { date: string; activity: string }[] = [
  { date: '01/05/2024', activity: 'Created user account for Jane Smith' },
  { date: '01/05/2024', activity: 'Created user account for Jane Smith' },
  { date: '01/05/2024', activity: 'Created user account for Jane Smith' },
  { date: '01/05/2024', activity: 'Updated subscription for Facility 1' },
]

function idNoForIndex(i: number): string {
  const n = i + 1
  return String(1001000 + n).slice(1)
}

export const MOCK_FACILITIES: FacilityRow[] = Array.from({ length: 40 }, (_, i) => {
  const active = i % 9 !== 0
  return {
    id: `fac-${i + 1}`,
    idNo: idNoForIndex(i),
    facilityName: i % 4 === 0 ? 'Facility Name' : `Facility Alpha ${i + 1}`,
    location: i % 3 === 0 ? 'Lagos Nigeria' : 'Location',
    status: active ? 'active' : 'inactive',
    adminInCharge: i % 2 === 0 ? 'Facility Admin' : `Admin ${i + 1}`,
  }
})

export function getFacilityStats(rows: FacilityRow[]) {
  const total = rows.length
  const active = rows.filter((r) => r.status === 'active').length
  const inactive = rows.filter((r) => r.status === 'inactive').length
  return { total, active, inactive }
}

const EXTRA_FACILITIES_KEY = 'xaccess_facilities_extra'

export function getExtraFacilities(): FacilityRow[] {
  if (typeof sessionStorage === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(EXTRA_FACILITIES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as FacilityRow[]
  } catch {
    return []
  }
}

export function registerFacilityRow(row: FacilityRow): void {
  if (typeof sessionStorage === 'undefined') return
  const list = getExtraFacilities()
  list.push(row)
  sessionStorage.setItem(EXTRA_FACILITIES_KEY, JSON.stringify(list))
}

export function getAllFacilityRows(): FacilityRow[] {
  return [...MOCK_FACILITIES, ...getExtraFacilities()]
}

export function getFacilityById(id: string): FacilityRow | undefined {
  return getAllFacilityRows().find((f) => f.id === id)
}

const FACILITY_SEQ_KEY = 'xaccess_facility_seq'

/** Next demo facility row for Create Facility (persisted in sessionStorage). */
export function createNewFacilityRow(input: {
  facilityName: string
  location: string
  adminInCharge: string
}): FacilityRow {
  let next: number
  if (typeof sessionStorage !== 'undefined') {
    const raw = sessionStorage.getItem(FACILITY_SEQ_KEY)
    next = raw ? parseInt(raw, 10) + 1 : MOCK_FACILITIES.length + 1
    sessionStorage.setItem(FACILITY_SEQ_KEY, String(next))
  } else {
    next = MOCK_FACILITIES.length + 1
  }
  return {
    id: `fac-${Date.now()}`,
    idNo: String(1001000 + next).slice(1),
    facilityName: input.facilityName,
    location: input.location,
    adminInCharge: input.adminInCharge,
    status: 'active',
  }
}

export function enrichFacilityDetail(row: FacilityRow): FacilityDetail {
  const slug = row.facilityName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')
  return {
    ...row,
    email: `${slug || 'facility'}@example.com`,
    phone: '(123) 456-7890',
    facilityAdmin: row.adminInCharge,
    registrationDate: '01/05/2024',
    powerUsageKwh: 1200,
    waterUsageLiters: 15000,
    totalUsers: 150,
    subscriptionStatusLine: row.status === 'active' ? 'Active' : 'Inactive',
    adminName: 'Admin Name',
    adminEmail: 'Email@example.com',
    adminPhone: '(123) 456-7890',
    lastLogin: '2024-06-28',
    subscriptionType: 'Premium',
    subStartDate: '2024-01-01',
    subEndDate: '2024-12-31',
    paymentStatus: 'Paid',
  }
}
