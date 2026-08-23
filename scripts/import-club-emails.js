/**
 * Reads snm-clubs-needing-emails.csv back into the database.
 *
 * The CSV is the research worksheet: fill in the email (and website, if you
 * found one) beside a club and run this. Rows with a blank email are skipped,
 * so it is safe to run repeatedly as the list gets filled in a few at a time.
 *
 *   node scripts/import-club-emails.js            # dry run
 *   node scripts/import-club-emails.js --commit
 */
require('dotenv').config({ path: '.env.local', quiet: true })
const fs = require('fs')
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

const FILE = 'snm-clubs-needing-emails.csv'
const commit = process.argv.includes('--commit')

// A CSV parser rather than a split on commas: club names carry commas, and a
// quoted field is the whole point of the format.
function parseLine(line) {
  const out = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i]
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i += 1 }
      else if (c === '"') inQ = false
      else cur += c
    } else if (c === '"') inQ = true
    else if (c === ',') { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

;(async () => {
  const lines = fs.readFileSync(FILE, 'utf8').split(/\r?\n/).filter(Boolean)
  const head = parseLine(lines[0])
  const iName = head.indexOf('club')
  const iEmail = head.indexOf('email')
  const iSite = head.indexOf('website')

  let set = 0, skipped = 0, missing = 0
  for (const line of lines.slice(1)) {
    const f = parseLine(line)
    const name = (f[iName] || '').trim()
    const email = (f[iEmail] || '').trim()
    const site = (f[iSite] || '').trim()
    if (!email) { skipped += 1; continue }

    const [row] = await sql`SELECT id, email FROM clubs WHERE name = ${name}`
    if (!row) { console.log('NOT IN DB:', name); missing += 1; continue }
    if (row.email) { console.log('ALREADY HAS ONE:', name, row.email); continue }

    console.log((commit ? 'SET  ' : 'would set '), name, '->', email)
    if (commit) {
      if (site) await sql`UPDATE clubs SET email = ${email}, website = ${site}, updated_at = NOW() WHERE id = ${row.id}`
      else await sql`UPDATE clubs SET email = ${email}, updated_at = NOW() WHERE id = ${row.id}`
    }
    set += 1
  }
  console.log(`\n${set} to set, ${skipped} still blank, ${missing} not matched`)
  if (!commit) console.log('dry run - re-run with --commit')
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })
