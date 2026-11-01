// Adds the French texts to an n8n checkout: copies languages/fr.json next to
// en.json and registers it in the i18n package. Fails loudly if n8n moved things.
// A translation that no longer fits n8n's English (a variable, tag or plural form
// changed since) is left out, so the editor shows the English text instead.
//   node script/patch-n8n.mjs path/to/n8n
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { check, flatten, showKey, unflatten, untranslatable } from './lib.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const n8n = resolve(process.argv[2] ?? 'n8n')
const i18n = join(n8n, 'packages/frontend/@n8n/i18n/src')

const enTree = JSON.parse(readFileSync(join(i18n, 'locales/en.json'), 'utf-8'))
const en = flatten(enTree)
const fr = flatten(JSON.parse(readFileSync(join(root, 'languages/fr.json'), 'utf-8')))
for (const k of Object.keys(fr)) {
  if (en[k] === undefined || untranslatable(en[k]) || !check(en[k], fr[k]).length) continue
  console.log(`left out ${showKey(k)}`)
  delete fr[k]
}
writeFileSync(join(i18n, 'locales/fr.json'), JSON.stringify(unflatten(fr, enTree), null, 2) + '\n', 'utf-8')

const file = join(i18n, 'index.ts')
let src = readFileSync(file, 'utf-8')
const replace = (from, to) => {
  if (!from.test(src)) throw new Error(`patch-n8n: ${from} not found in ${file}`)
  src = src.replace(from, to)
}
replace(/^(import (\w+) from '\.\/locales\/en\.json';)$/m, "$1\nimport frenchBaseText from './locales/fr.json';")
replace(/messages:\s*\{\s*en:\s*(\w+)\s*,?\s*\}/, 'messages: { en: $1, fr: frenchBaseText }')
writeFileSync(file, src, 'utf-8')
console.log(`patched ${file}`)
