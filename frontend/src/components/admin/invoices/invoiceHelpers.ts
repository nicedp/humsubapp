import { format } from 'date-fns'
import { Invoice, InvoiceItemPayload, CreateInvoicePayload } from '../../../api/invoices'

export const fmtINR = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const emptyItem = (): InvoiceItemPayload => ({ description: '', quantity: 1, unitPrice: 0 })

export const defaultForm = (societyName: string, address: string): CreateInvoicePayload => ({
  fromName: societyName,
  fromAddress: address,
  fromPhone: '',
  fromEmail: '',
  toName: '',
  toAddress: '',
  toPhone: '',
  toEmail: '',
  invoiceDate: format(new Date(), 'yyyy-MM-dd'),
  dueDate: '',
  items: [emptyItem()],
  taxRate: 0,
  notes: '',
  status: 'draft',
})

export const calcTotals = (items: InvoiceItemPayload[], taxRate: number) => {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  return { subtotal, taxAmount, total }
}

export const printInvoice = (inv: Invoice) => {
  const win = window.open('', '_blank', 'width=800,height=1050')
  if (!win) return
  const fmt = fmtINR
  win.document.write(`
    <!DOCTYPE html>
    <html><head>
      <title>Invoice ${inv.invoiceNumber}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Arial,sans-serif;font-size:13px;color:#111;background:#fff;padding:32px}
        .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:20px}
        .society-name{font-size:20px;font-weight:bold;color:#2563eb}
        .inv-no{font-size:18px;font-weight:bold;color:#374151;text-align:right}
        .inv-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px}
        .parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px}
        .party h3{font-size:11px;font-weight:600;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px;margin-bottom:6px}
        .party p{font-size:13px;color:#111;line-height:1.6}
        .party .name{font-size:15px;font-weight:bold;color:#111}
        .dates{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin-bottom:20px}
        .dates label{font-size:10px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px}
        .dates p{font-size:13px;font-weight:600;color:#111;margin-top:2px}
        table{width:100%;border-collapse:collapse;margin-bottom:12px}
        th{background:#f1f5f9;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;border:1px solid #e2e8f0}
        td{padding:9px 12px;border:1px solid #e2e8f0;font-size:13px}
        .totals{display:flex;justify-content:flex-end;margin-bottom:20px}
        .totals-box{width:280px}
        .totals-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px}
        .totals-row.grand{border-top:2px solid #2563eb;padding-top:10px;margin-top:5px;font-size:16px;font-weight:bold;color:#2563eb}
        .status-badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:capitalize;background:#dcfce7;color:#166534}
        .notes{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px;color:#374151;margin-bottom:20px}
        .footer{text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px}
        @media print{@page{margin:1cm;size:A4}body{padding:0}}
      </style>
    </head><body>
      <div class="header">
        <div>
          <div class="society-name">${inv.fromName}</div>
          ${inv.fromAddress ? `<div style="font-size:12px;color:#6b7280;margin-top:4px">${inv.fromAddress}</div>` : ''}
          ${inv.fromPhone ? `<div style="font-size:12px;color:#6b7280">📞 ${inv.fromPhone}</div>` : ''}
          ${inv.fromEmail ? `<div style="font-size:12px;color:#6b7280">✉ ${inv.fromEmail}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div class="inv-label">Invoice</div>
          <div class="inv-no">${inv.invoiceNumber}</div>
          <div style="margin-top:6px"><span class="status-badge">${inv.status}</span></div>
        </div>
      </div>
      <div class="parties">
        <div class="party">
          <h3>From</h3>
          <p class="name">${inv.fromName}</p>
        </div>
        <div class="party">
          <h3>Bill To</h3>
          <p class="name">${inv.toName}</p>
          ${inv.toAddress ? `<p>${inv.toAddress}</p>` : ''}
          ${inv.toPhone ? `<p>📞 ${inv.toPhone}</p>` : ''}
          ${inv.toEmail ? `<p>✉ ${inv.toEmail}</p>` : ''}
        </div>
      </div>
      <div class="dates">
        <div>
          <label>Invoice Date</label>
          <p>${format(new Date(inv.invoiceDate), 'dd MMM yyyy')}</p>
        </div>
        <div>
          <label>Due Date</label>
          <p>${inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM yyyy') : '—'}</p>
        </div>
        <div>
          <label>Status</label>
          <p style="text-transform:capitalize">${inv.status}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:40%">Description</th>
            <th style="width:15%;text-align:right">Qty</th>
            <th style="width:20%;text-align:right">Unit Price</th>
            <th style="width:25%;text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align:right">${item.quantity}</td>
              <td style="text-align:right">${fmt(item.unitPrice)}</td>
              <td style="text-align:right">${fmt(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="totals-box">
          <div class="totals-row"><span>Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
          ${inv.taxRate > 0 ? `<div class="totals-row"><span>Tax (${inv.taxRate}%)</span><span>${fmt(inv.taxAmount)}</span></div>` : ''}
          <div class="totals-row grand"><span>Total</span><span>${fmt(inv.totalAmount)}</span></div>
        </div>
      </div>
      ${inv.notes ? `<div class="notes"><strong>Notes:</strong> ${inv.notes}</div>` : ''}
      <div class="footer">
        <p>Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')} &nbsp;|&nbsp; ${inv.fromName}</p>
      </div>
    </body></html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}