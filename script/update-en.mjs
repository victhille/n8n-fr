// Downloads n8n's English texts for a version into script/en.json, then reports
// what is left to translate. Without a version, takes the latest n8n release.
//   node script/update-en.mjs [2.43.8]
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { report } from './status.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const headers = { 'User-Agent': 'n8n-fr', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) }

let version = process.argv[2]
if (!version) {
  const res = await fetch('https://api.github.com/repos/n8n-io/n8n/releases/latest', { headers })
  if (!res.ok) throw new Error(`GitHub: ${res.status}`)
  version = (await res.json()).tag_name.replace(/^n8n@/, '')
}
const url = `https://raw.githubusercontent.com/n8n-io/n8n/n8n@${version}/packages/frontend/@n8n/i18n/src/locales/en.json`
const res = await fetch(url, { headers })
if (!res.ok) throw new Error(`${url}: ${res.status}`)
const text = await res.text()
JSON.parse(text)
writeFileSync(join(root, 'script/en.json'), text, 'utf-8')
console.log(`n8n ${version}`)
console.log(report().line)
