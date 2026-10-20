// Shared helpers: flatten / unflatten n8n's nested locale JSON, and the checks
// that keep a translation from breaking the editor.

/** { a: { b: 'x' } } → { 'a.b': 'x' } (only the nested `_reusable…` blocks are objects) */
export function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}\u0000${k}` : k
    if (v && typeof v === 'object') flatten(v, key, out)
    else out[key] = v
  }
  return out
}

/** Inverse of flatten; keys keep the order of `reference` (the English file) */
export function unflatten(flat, reference) {
  const build = (ref, prefix) => {
    const o = {}
    for (const [k, v] of Object.entries(ref)) {
      const key = prefix ? `${prefix}\u0000${k}` : k
      if (v && typeof v === 'object') {
        const child = build(v, key)
        if (Object.keys(child).length) o[k] = child
      } else if (flat[key] !== undefined) o[k] = flat[key]
    }
    return o
  }
  return build(reference, '')
}

/** Readable key for the work files */
export const showKey = k => k.replace(/\u0000/g, '.')

/** Nothing to translate: links to other messages, bare URLs, no letters */
export function untranslatable(v) {
  if (typeof v !== 'string' || !v.trim()) return true
  if (/^@:[\w.$-]+$/.test(v.trim())) return true
  if (/^(https?:\/\/|\/)\S*$/.test(v.trim())) return true
  return !/[A-Za-z]{2,}/.test(v.replace(/\{[^}]*\}/g, '').replace(/<[^>]+>/g, ''))
}

const sorted = a => [...a].sort()

/** Pieces that must come through unchanged */
export function tokens(v) {
  return {
    vars: sorted(v.match(/\{[\w.$-]+\}/g) ?? []),
    escapes: sorted(v.match(/\{'[^']*'\}/g) ?? []),
    links: sorted(v.match(/@:[\w.$-]+/g) ?? []),
    tags: sorted((v.match(/<\/?[a-zA-Z][\w-]*/g) ?? []).map(t => t.toLowerCase())),
    hrefs: sorted(v.match(/(?:href|src)=['"][^'"]*['"]/g) ?? []),
    pipes: (v.match(/ \| /g) ?? []).length
  }
}

/** Problems in a translation, [] when it is safe */
export function check(en, fr) {
  if (typeof fr !== 'string' || !fr.trim()) return ['empty']
  const a = tokens(en), b = tokens(fr)
  const errors = []
  for (const k of ['vars', 'escapes', 'links', 'tags', 'hrefs']) {
    if (a[k].join('\n') !== b[k].join('\n')) errors.push(`${k}: ${a[k].join(' ')} → ${b[k].join(' ')}`)
  }
  if (a.pipes !== b.pipes) errors.push(`plural forms: ${a.pipes + 1} → ${b.pipes + 1}`)
  // vue-i18n reads a bare @ { } | as syntax: they must stay escaped like in English
  const bare = s => (s.replace(/\{'[^']*'\}/g, '').replace(/\{[\w.$-]+\}/g, '').replace(/@:[\w.$-]+/g, '').match(/[@{}]/g) ?? []).length
  if (bare(fr) > bare(en)) errors.push('unescaped @ { or }')
  if (/\|/.test(fr.replace(/ \| /g, '')) && !/\|/.test(en.replace(/ \| /g, ''))) errors.push('stray |')
  return errors
}

/** One line per message in the work files: newlines and tabs escaped */
export const encode = s => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
export const decode = s => s.replace(/\\(\\|n|t)/g, (_, c) => (c === 'n' ? '\n' : c === 't' ? '\t' : '\\'))
