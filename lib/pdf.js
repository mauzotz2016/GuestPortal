import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { LOGO_B64, LOGO_RATIO } from './logo'

const COMPANY = 'Tiffany Diamond Hotels Limited'
const GOLD = rgb(0.69, 0.55, 0.24), DARK = rgb(0.11, 0.1, 0.08), GREY = rgb(0.4, 0.38, 0.33), LINE = rgb(0.85, 0.82, 0.75)
const COLS = [['#', 28], ['Registration Date', 108], ['Full Name', 185], ['Country', 108], ['Check-in', 68], ['Check-out', 68], ['Branch', 90], ['Registered By', 115]]
const W = 841.89, H = 595.28, M = 36, ROW = 18, FS = 8.5

const clean = s => String(s ?? '').replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?')
const dmy = s => (s || '').split('-').reverse().join('.')
const stamp = iso => new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Dar_es_Salaam' })

export async function buildPdf({ rows, from, to, branch, generatedBy }) {
  const pdf = await PDFDocument.create()
  pdf.setTitle('Guest Registration Report'); pdf.setAuthor(COMPANY); pdf.setCreator('Tiffany Guest Registration Portal')
  const f = await pdf.embedFont(StandardFonts.Helvetica), fb = await pdf.embedFont(StandardFonts.HelveticaBold), fi = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const logo = await pdf.embedPng(Buffer.from(LOGO_B64, 'base64'))
  const now = new Date()
  const ref = 'TDH-GR-' + now.toISOString().slice(0, 16).replace(/[-:T]/g, '')
  const fit = (t, w, font = f, size = FS) => {
    t = clean(t); if (font.widthOfTextAtSize(t, size) <= w) return t
    while (t.length > 1 && font.widthOfTextAtSize(t + '...', size) > w) t = t.slice(0, -1)
    return t + '...'
  }
  const pages = []
  let page, y

  const newPage = first => {
    page = pdf.addPage([W, H]); pages.push(page)
    const lh = first ? 58 : 38
    page.drawImage(logo, { x: M, y: H - M - lh, width: lh * LOGO_RATIO, height: lh })
    const tx = M + lh * LOGO_RATIO + 16
    page.drawText('GUEST REGISTRATION REPORT', { x: tx, y: H - M - (first ? 22 : 16), size: first ? 17 : 13, font: fb, color: DARK })
    page.drawText(`Period: ${dmy(from)} to ${dmy(to)}   |   Branch: ${branch || 'All branches'}`, { x: tx, y: H - M - (first ? 38 : 31), size: 9.5, font: f, color: GREY })
    if (first) page.drawText(`Ref: ${ref}   |   Generated: ${now.toLocaleString('en-GB', { timeZone: 'Africa/Dar_es_Salaam' })}   |   By: ${clean(generatedBy)}`, { x: tx, y: H - M - 52, size: 8.5, font: f, color: GREY })
    y = H - M - lh - 12
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.5, color: GOLD }); y -= 14
    if (first) {
      const per = {}; rows.forEach(r => { per[r.branch] = (per[r.branch] || 0) + 1 })
      const sum = `Total guests: ${rows.length}` + Object.entries(per).map(([b, c]) => `   |   ${b}: ${c}`).join('')
      page.drawText(clean(sum), { x: M, y, size: 10, font: fb, color: DARK }); y -= 20
    }
    page.drawRectangle({ x: M, y: y - 5, width: W - 2 * M, height: ROW, color: rgb(0.96, 0.93, 0.85) })
    let x = M + 4
    COLS.forEach(([n, w]) => { page.drawText(n.toUpperCase(), { x, y: y, size: 7.5, font: fb, color: GREY }); x += w }); y -= ROW + 2
  }

  newPage(true)
  rows.forEach((g, i) => {
    if (y < M + 52) newPage(false)
    const cells = [i + 1, stamp(g.registered_at), g.full_name, g.country, dmy(g.check_in), dmy(g.check_out), g.branch, g.user_name]
    let x = M + 4
    cells.forEach((c, k) => { page.drawText(fit(c, COLS[k][1] - 8), { x, y, size: FS, font: f, color: DARK }); x += COLS[k][1] })
    page.drawLine({ start: { x: M, y: y - 5 }, end: { x: W - M, y: y - 5 }, thickness: 0.4, color: LINE }); y -= ROW
  })
  if (!rows.length) page.drawText('No records found for the selected period.', { x: M + 4, y, size: 10, font: fi, color: GREY })

  const note = `This is an official document and the property of ${COMPANY}. It contains confidential guest information and is valid only when issued from the Tiffany Guest Registration Portal.`
  const note2 = 'Unauthorized copying, alteration, distribution or disclosure is strictly prohibited.'
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.6, color: GOLD })
    p.drawText(note, { x: M, y: 33, size: 7.5, font: fi, color: GREY })
    p.drawText(note2, { x: M, y: 23, size: 7.5, font: fi, color: GREY })
    const pg = `Page ${i + 1} of ${pages.length}`
    p.drawText(pg, { x: W - M - fb.widthOfTextAtSize(pg, 8), y: 28, size: 8, font: fb, color: DARK })
    const rf = ref; p.drawText(rf, { x: W - M - f.widthOfTextAtSize(rf, 7.5), y: 18, size: 7.5, font: f, color: GREY })
  })
  return pdf.save()
}
