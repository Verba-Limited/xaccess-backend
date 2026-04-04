export type AccessDashboardRow = {
  id: string
  guestName: string
  hostName: string
  tokenPreview: string
  tokenFull: string
  accessType: string
  block: string
  checkInTime: string
  checkOutTime: string
  arrivalDate: string
  /** e.g. 01/05/2024 - 03/05/2024 */
  validity: string
  date: string
}

const TOTAL = 40

const DETAIL_DEFAULTS = {
  block: 'Block 20',
  checkInTime: '01/05/2024',
  checkOutTime: '01/05/2024',
  arrivalDate: '01/05/2024',
  validity: '01/05/2024 - 03/05/2024',
  date: '01/05/2024',
}

function buildRows(): AccessDashboardRow[] {
  return Array.from({ length: TOTAL }, (_, i) => {
    const n = i + 1
    const suffix = `${String(n).padStart(4, '0')}A9F2`
    const tokenFull = `MD2041${suffix}`
    const isFirst = i === 0
    return {
      id: `access-${n}`,
      guestName: isFirst ? 'Abdul Rokeeb Adedolapo' : 'Admin Name',
      hostName: 'Host Name',
      tokenPreview: `${tokenFull.slice(0, 6)}…`,
      tokenFull,
      accessType: 'One Time',
      ...DETAIL_DEFAULTS,
    }
  })
}

const ROWS = buildRows()

export function getAccessDashboardRows(): AccessDashboardRow[] {
  return ROWS
}

export function getAccessDashboardRowById(id: string): AccessDashboardRow | undefined {
  return ROWS.find((r) => r.id === id)
}
