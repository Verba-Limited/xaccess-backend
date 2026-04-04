export type SecurityPerson = {
  id: string
  securityName: string
  email: string
  phone: string
  homeAddress: string
  isActive: boolean
  registrationDate: string
  credentialEmail: string
}

export const TOTAL_SECURITY_MOCK = 40

function buildSecurityRows(): SecurityPerson[] {
  return Array.from({ length: TOTAL_SECURITY_MOCK }, (_, i) => {
    const id = `security-${i + 1}`
    if (i === 0) {
      return {
        id,
        securityName: 'Abdul Rokeeb Adedolapo',
        email: 'Email@example.com',
        phone: '(123) 456-7890',
        homeAddress: 'Facility 1',
        isActive: true,
        registrationDate: '01/05/2024',
        credentialEmail: 'Email@example.com',
      }
    }
    return {
      id,
      securityName: 'Admin Name',
      email: 'Email@mail.com',
      phone: 'Phone Number',
      homeAddress: 'Location',
      isActive: true,
      registrationDate: '01/01/2024',
      credentialEmail: 'Email@mail.com',
    }
  })
}

const ROWS = buildSecurityRows()

export function getSecurityRows(): SecurityPerson[] {
  return ROWS
}

export function getSecurityById(id: string): SecurityPerson | undefined {
  return ROWS.find((r) => r.id === id)
}
