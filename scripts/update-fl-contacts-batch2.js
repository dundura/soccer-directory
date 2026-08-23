require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

// Domains found by visiting each club's own site. Florida Hawks is absent on
// purpose: floridahawksfc.com now 301s to fishhawkpremierfc.com, so the club
// has folded into Florida Premier and the president@ username is dead.
const FOUND = [
  ['St. Petersburg Football Club', 'cburt@stpetefootballclub.com', 'https://stpetefootballclub.com'],
  ['Tampa Dynamo Football Club',   'clubadmin@tampadynamofc.com',  'https://www.tampadynamofc.com'],
  ['Football Club Sarasota',       'dforway@fcsarasota.com',       'https://www.fcsarasota.com'],
]

const commit = process.argv.includes('--commit')
;(async () => {
  for (const [name, email, site] of FOUND) {
    const [row] = await sql`SELECT id, name, email FROM clubs WHERE name = ${name}`
    if (!row) { console.log('NOT FOUND:', name); continue }
    if (row.email) { console.log('SKIP (has email):', name, row.email); continue }
    console.log((commit ? 'SET  ' : 'would set '), name, '->', email)
    if (commit) {
      await sql`UPDATE clubs SET email = ${email}, website = ${site}, updated_at = NOW() WHERE id = ${row.id}`
    }
  }
  if (!commit) console.log('\ndry run - re-run with --commit')
})().catch(e => { console.error('ERR', e.message); process.exit(1) })
