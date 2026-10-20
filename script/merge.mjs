// Checks work/*.fr.tsv against the English text and merges the good lines into
// languages/fr.json. Lines with a problem are listed and left out (English shows instead).
//   node script/merge.mjs
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { check, decode, flatten, unflatten, untranslatable } from './lib.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const enTree = JSON.parse(readFileSync(join(root, 'script/en.json'), 'utf-8'))
const en = flatten(enTree)
const frFile = join(root, 'languages/fr.json')
const fr = existsSync(frFile) ? flatten(JSON.parse(readFileSync(frFile, 'utf-8'))) : {}
const sourceFile = join(root, 'script/translated-from.json')
const source = existsSync(sourceFile) ? JSON.parse(readFileSync(sourceFile, 'utf-8')) : {}
const work = join(root, 'work')
const index = JSON.parse(readFileSync(join(work, 'index.json'), 'utf-8'))
const byShown = Object.fromEntries(Object.keys(en).map(k => [k.replace(/\u0000/g, '.'), k]))

let merged = 0
const problems = []
for (const file of readdirSync(work).filter(f => f.endsWith('.fr.tsv')).sort()) {
  for (const line of readFileSync(join(work, file), 'utf-8').split(/\r?\n/)) {
    if (!line.trim()) continue
    const tab = line.indexOf('\t')
    const id = line.slice(0, tab).trim()
    const shown = index[id]
    if (tab < 0 || !shown) { problems.push(`${file}: unknown line "${line.slice(0, 40)}"`); continue }
    const key = byShown[shown]
    const text = decode(line.slice(tab + 1))
    const errors = check(en[key], text)
    if (errors.length) { problems.push(`${file} #${id} ${shown}: ${errors.join('; ')}`); continue }
    fr[key] = text
    source[shown] = en[key]
    merged++
  }
}

// Messages with nothing to translate keep the English text (links, URLs)
for (const [k, v] of Object.entries(en)) if (untranslatable(v)) fr[k] = v
// Keys n8n removed go away
for (const k of Object.keys(fr)) if (en[k] === undefined) delete fr[k]

writeFileSync(frFile, JSON.stringify(unflatten(fr, enTree), null, 2) + '\n', 'utf-8')
writeFileSync(sourceFile, JSON.stringify(source, null, 0) + '\n', 'utf-8')
const translatable = Object.keys(en).filter(k => !untranslatable(en[k]))
const done = translatable.filter(k => fr[k] !== undefined && source[k.replace(/\u0000/g, '.')] === en[k]).length
console.log(`${merged} merged · ${done}/${translatable.length} translated (${Math.round((done / translatable.length) * 100)} %)`)
if (problems.length) { console.log(`${problems.length} problem(s):`); for (const p of problems) console.log('  ' + p) }
process.exitCode = problems.length ? 1 : 0
