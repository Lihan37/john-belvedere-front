export const APP_NAME = import.meta.env.VITE_APP_NAME || 'John Belvedere'

export const DRINK_CATEGORIES = new Set([
  'Sauces',
  'Extras',
  'Soft Drinks',
  'Iced Tea',
  'Shakes',
  'Juices',
  'Cocktails',
  'Mocktails',
  'Spirits Mixes & Shots',
  'Beers',
  'Bombs',
  'House Wine',
])

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

export const isDrinkCategory = (category = '') => DRINK_CATEGORIES.has(category)

export function getCloudinaryImageUrl(
  source,
  {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
  } = {},
) {
  if (!source || typeof source !== 'string' || !source.includes('/image/upload/')) {
    return source
  }

  const transforms = [`f_${format}`, `q_${quality}`]

  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (crop) transforms.push(`c_${crop}`)
  if (gravity && crop !== 'fit' && crop !== 'limit') transforms.push(`g_${gravity}`)

  return source.replace('/image/upload/', `/image/upload/${transforms.join(',')}/`)
}

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

export async function downloadOrderVoucher(order, options = {}) {
  if (!order) return

  const { jsPDF } = await import('jspdf')
  const title = options.title || APP_NAME
  const paymentMethod = order.paymentMethod === 'stripe' ? 'Stripe payment' : 'Counter cash'
  const paymentStatus = order.paymentStatus || 'unpaid'
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 42
  const contentWidth = pageWidth - margin * 2
  const accent = [163, 63, 23]
  const ink = [47, 34, 24]
  const muted = [122, 101, 86]
  let cursorY = margin

  const ensureSpace = (requiredHeight = 40) => {
    if (cursorY + requiredHeight <= pageHeight - margin) {
      return
    }

    pdf.addPage()
    cursorY = margin
  }

  pdf.setFillColor(255, 250, 243)
  pdf.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 24, 24, 'F')
  pdf.setDrawColor(222, 207, 188)
  pdf.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 24, 24, 'S')

  cursorY += 24

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(...muted)
  pdf.text(title.toUpperCase(), margin + 20, cursorY)

  cursorY += 28
  pdf.setFont('times', 'bold')
  pdf.setFontSize(28)
  pdf.setTextColor(...ink)
  pdf.text('Order Voucher', margin + 20, cursorY)

  cursorY += 22
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.setTextColor(...muted)
  pdf.text(`Order #${String(order._id).slice(0, 6)}`, margin + 20, cursorY)
  cursorY += 16
  pdf.text(formatOrderTime(order.createdAt), margin + 20, cursorY)

  cursorY += 28
  const summaryCards = [
    ['Status', order.status || 'pending'],
    ['Payment', paymentMethod],
    ['Payment Status', paymentStatus],
    ['Total', currency(order.totalPrice || 0)],
  ]
  const cardGap = 12
  const cardWidth = (contentWidth - 40 - cardGap) / 2

  summaryCards.forEach(([label, value], index) => {
    const row = Math.floor(index / 2)
    const column = index % 2
    const x = margin + 20 + column * (cardWidth + cardGap)
    const y = cursorY + row * 72
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(x, y, cardWidth, 58, 16, 16, 'F')
    pdf.setDrawColor(234, 223, 206)
    pdf.roundedRect(x, y, cardWidth, 58, 16, 16, 'S')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...muted)
    pdf.text(label.toUpperCase(), x + 14, y + 18)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)
    pdf.setTextColor(...ink)
    const valueLines = pdf.splitTextToSize(String(value), cardWidth - 28)
    pdf.text(valueLines, x + 14, y + 38)
  })

  cursorY += 160
  ensureSpace(90)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(...muted)
  pdf.text('ITEM', margin + 20, cursorY)
  pdf.text('QTY', margin + 250, cursorY)
  pdf.text('PRICE', margin + 310, cursorY)
  pdf.text('LINE TOTAL', margin + 400, cursorY)

  cursorY += 14
  pdf.setDrawColor(222, 207, 188)
  pdf.line(margin + 20, cursorY, pageWidth - margin - 20, cursorY)
  cursorY += 20

  ;(order.items || []).forEach((item) => {
    ensureSpace(54)

    const itemLines = pdf.splitTextToSize(String(item.name || ''), 200)
    const rowHeight = Math.max(34, itemLines.length * 14 + 10)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(...ink)
    pdf.text(itemLines, margin + 20, cursorY)
    pdf.text(String(item.quantity || 0), margin + 250, cursorY)
    pdf.text(currency(item.price || 0), margin + 310, cursorY)
    pdf.text(
      currency(Number(item.price || 0) * Number(item.quantity || 0)),
      margin + 400,
      cursorY,
    )
    cursorY += rowHeight
    pdf.setDrawColor(234, 223, 206)
    pdf.line(margin + 20, cursorY - 10, pageWidth - margin - 20, cursorY - 10)
  })

  ensureSpace(70)
  cursorY += 10
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.setTextColor(...accent)
  pdf.text('Grand Total', margin + 20, cursorY)
  pdf.text(currency(order.totalPrice || 0), pageWidth - margin - 20, cursorY, {
    align: 'right',
  })

  pdf.save(`voucher-${String(order._id).slice(0, 6)}.pdf`)
}
