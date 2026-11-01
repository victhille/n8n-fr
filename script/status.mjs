// How much of script/en.json languages/fr.json covers, and whether every French
// text is safe for the editor. Exit code 1 when a translation would break it.
//   node script/status.mjs [--list]
import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { check, flatten, showKey, untranslatable } from './lib.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export function report() {
  const en = flatten(JSON.parse(readFileSync(join(root, 'script/en.json'), 'utf-8')))
  const fr = flatten(JSON.parse(readFileSync(join(root, 'languages/fr.json'), 'utf-8')))
  const sourceFile = join(root, 'script/translated-from.json')
  const source = existsSync(sourceFile) ? JSON.parse(readFileSync(sourceFile, 'utf-8')) : {}

  const translatable = Object.keys(en).filter(k => !untranslatable(en[k]))
  const missing = translatable.filter(k => fr[k] === undefined).map(showKey)
  const outdated = translatable.filter(k => fr[k] !== undefined && source[showKey(k)] !== en[k]).map(showKey)
  // A translation n8n changed in English since is only stale: patch-n8n.mjs leaves
  // it out of the build when it no longer fits, so it does not count as an error
  const checked = Object.keys(fr).filter(k => en[k] !== undefined && !untranslatable(en[k]))
  const broken = checked
    .filter(k => source[showKey(k)] === en[k])
    .flatMap(k => check(en[k], fr[k]).map(e => `${showKey(k)}: ${e}`))
  const dropped = checked.filter(k => source[showKey(k)] !== en[k] && check(en[k], fr[k]).length).map(showKey)
  const done = translatable.length - missing.length - outdated.length
  const pct = Math.floor((done / translatable.length) * 1000) / 10
  return {
    missing, outdated, dropped, broken, done, total: translatable.length, pct,
    line: `${done}/${translatable.length} traduits (${pct} %) · ${missing.length} nouveaux · ${outdated.length} modifiés en anglais (${dropped.length} affichés en anglais) · ${broken.length} erreur(s)`
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const r = report()
  console.log(r.line)
  if (process.argv.includes('--list')) {
    for (const k of r.missing) console.log(`  nouveau   ${k}`)
    for (const k of r.outdated) console.log(`  modifié   ${k}`)
    for (const k of r.dropped) console.log(`  écarté    ${k}`)
  }
  for (const e of r.broken) console.log(`  erreur    ${e}`)
  process.exitCode = r.broken.length ? 1 : 0
}
