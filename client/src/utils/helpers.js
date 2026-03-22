export const APP_NAME = import.meta.env.VITE_APP_NAME || 'John Belvedere'

export const currency = (value) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

export const formatOrderTime = (value) =>
  new Intl.DateTimeFormat('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const formatDateInput = (value = new Date()) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const sanitizePhone = (value = '') => value.replace(/[^\d+]/g, '')

export const getAllowedAdminPhones = () =>
  (import.meta.env.VITE_ALLOWED_ADMIN_PHONES || '')
    .split(',')
    .map((phone) => sanitizePhone(phone))
    .filter(Boolean)

export const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key) {
    localStorage.removeItem(key)
  },
}

export const calculateCartTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)

export function playNotificationSound() {
  if (typeof window === 'undefined') return

  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  try {
    const audioContext = new AudioContextClass()
    const now = audioContext.currentTime
    const tones = [
      { frequency: 880, start: 0, duration: 0.22 },
      { frequency: 660, start: 0.24, duration: 0.22 },
      { frequency: 990, start: 0.5, duration: 0.3 },
    ]

    tones.forEach(({ frequency, start, duration }) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, now + start)

      gainNode.gain.setValueAtTime(0.0001, now + start)
      gainNode.gain.exponentialRampToValueAtTime(0.16, now + start + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start(now + start)
      oscillator.stop(now + start + duration)
    })

    window.setTimeout(() => {
      audioContext.close().catch(() => {})
    }, 1200)
  } catch {
    // Ignore autoplay or audio initialization failures.
  }
}

export function downloadOrderVoucher(order, options = {}) {
  if (!order) return

  const title = options.title || APP_NAME
  const paymentMethod = order.paymentMethod === 'stripe' ? 'Stripe payment' : 'Counter cash'
  const paymentStatus = order.paymentStatus || 'unpaid'
  const itemsMarkup = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${currency(item.price)}</td>
          <td>${currency(Number(item.price || 0) * Number(item.quantity || 0))}</td>
        </tr>`,
    )
    .join('')

  const voucherHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Voucher ${String(order._id).slice(0, 6)}</title>
    <style>
      body { font-family: Georgia, 'Times New Roman', serif; padding: 32px; color: #2f2218; background: #fffaf3; }
      .sheet { max-width: 820px; margin: 0 auto; border: 1px solid #decfbc; border-radius: 24px; padding: 32px; background: white; }
      .top { display: flex; justify-content: space-between; gap: 24px; align-items: start; }
      .eyebrow { letter-spacing: .25em; text-transform: uppercase; font-size: 12px; color: #7a6556; margin: 0 0 12px; }
      h1 { margin: 0; font-size: 40px; line-height: 1.05; }
      .meta { margin-top: 12px; color: #68564a; }
      .badges { display: flex; gap: 8px; flex-wrap: wrap; }
      .badge { border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #f4eadc; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 28px; }
      .card { border: 1px solid #eadfce; border-radius: 18px; padding: 16px; background: #fffaf5; }
      .label { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .2em; color: #7a6556; }
      .value { margin: 0; font-size: 18px; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; margin-top: 28px; }
      th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #eadfce; }
      th { font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: #7a6556; }
      .total { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 20px; border-top: 2px solid #decfbc; font-size: 22px; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="top">
        <div>
          <p class="eyebrow">${title}</p>
          <h1>Order Voucher</h1>
          <p class="meta">Order #${String(order._id).slice(0, 6)}<br />${formatOrderTime(order.createdAt)}</p>
        </div>
        <div class="badges">
          <span class="badge">${order.status}</span>
          <span class="badge">${paymentMethod}</span>
          <span class="badge">${paymentStatus}</span>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <p class="label">Payment</p>
          <p class="value">${paymentMethod}</p>
        </div>
        <div class="card">
          <p class="label">Payment Status</p>
          <p class="value">${paymentStatus}</p>
        </div>
        <div class="card">
          <p class="label">Total</p>
          <p class="value">${currency(order.totalPrice || 0)}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>${itemsMarkup}</tbody>
      </table>

      <div class="total">
        <span>Grand Total</span>
        <span>${currency(order.totalPrice || 0)}</span>
      </div>
    </div>
  </body>
</html>`

  const blob = new Blob([voucherHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `voucher-${String(order._id).slice(0, 6)}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
