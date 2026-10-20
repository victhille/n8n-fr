// Writes the messages still to translate into work/NNN.en.tsv (id <tab> English),
// a few thousand characters each. Translations go in work/NNN.fr.tsv (id <tab> French);
// `node script/merge.mjs` checks and merges them into languages/fr.json.
// Old work files are removed: merge everything before running it again.
//   node script/split.mjs [maxChars]
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { encode, flatten, showKey, untranslatable } from './lib.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const max = Number(process.argv[2]) || 7000
const en = flatten(JSON.parse(readFileSync(join(root, 'script/en.json'), 'utf-8')))
const frFile = join(root, 'languages/fr.json')
const fr = existsSync(frFile) ? flatten(JSON.parse(readFileSync(frFile, 'utf-8'))) : {}
// English text each French message was made from: a changed English text is translated again
const sourceFile = join(root, 'script/translated-from.json')
const source = existsSync(sourceFile) ? JSON.parse(readFileSync(sourceFile, 'utf-8')) : {}

const todo = Object.keys(en).filter(k => !untranslatable(en[k]) && (fr[k] === undefined || source[showKey(k)] !== en[k]))
const work = join(root, 'work')
if (existsSync(work)) for (const f of readdirSync(work)) if (f.endsWith('.tsv')) rmSync(join(work, f))
mkdirSync(work, { recursive: true })

const index = {}
let chunk = [], size = 0, n = 0
const flush = () => {
  if (!chunk.length) return
  n++
  writeFileSync(join(work, `${String(n).padStart(3, '0')}.en.tsv`), chunk.join('\n') + '\n', 'utf-8')
  chunk = []; size = 0
}
todo.forEach((k, i) => {
  const id = String(i + 1)
  index[id] = showKey(k)
  const line = `${id}\t${encode(en[k])}`
  if (size + line.length > max) flush()
  chunk.push(line); size += line.length
})
flush()
writeFileSync(join(work, 'index.json'), JSON.stringify(index), 'utf-8')
console.log(`${todo.length} message(s) to translate in ${n} file(s) (${Object.keys(en).length} in English)`)
