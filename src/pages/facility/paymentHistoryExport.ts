import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PaymentHistoryRow } from '@/pages/facility/invoiceFacilityMock'

function fileStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Exports the current filtered rows (matches search), not only the visible page. */
export function exportPaymentHistoryExcel(rows: PaymentHistoryRow[]): void {
  const data = rows.map((r) => ({
    'Resident Name': r.residentName,
    Apartment: r.apartment,
    'Payment Details': r.paymentDetails,
    Amount: r.amount,
    Status: r.status,
    Date: r.date,
  }))
  const ws = data.length
    ? XLSX.utils.json_to_sheet(data)
    : XLSX.utils.aoa_to_sheet([
        ['Resident Name', 'Apartment', 'Payment Details', 'Amount', 'Status', 'Date'],
      ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Received Payments')
  XLSX.writeFile(wb, `received-payment-history-${fileStamp()}.xlsx`)
}

export function exportPaymentHistoryPdf(rows: PaymentHistoryRow[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setFontSize(14)
  doc.text('Received Payment History', 14, 14)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated ${new Date().toLocaleString()} · ${rows.length} row(s)`, 14, 20)
  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: 26,
    head: [['Resident Name', 'Apartment', 'Payment Details', 'Amount', 'Status', 'Date']],
    body: rows.map((r) => [
      r.residentName,
      r.apartment,
      r.paymentDetails,
      r.amount,
      r.status,
      r.date,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [249, 157, 7],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
  })

  doc.save(`received-payment-history-${fileStamp()}.pdf`)
}
