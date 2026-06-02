// Post-processes the single-file phone build so it works when opened directly
// from the filesystem (file://) on a phone or desktop.
//
// Two problems are fixed here:
//   1. Browsers refuse to run inline `type="module"` scripts under file://,
//      which leaves the page blank. The bundle is built as a classic IIFE, so
//      we drop the module marker and run it as an ordinary <script>.
//   2. A classic script must run AFTER the #root element exists. Vite places
//      the script in <head>, where a classic (non-deferred) script would run
//      too early and React would fail with "target container is not a DOM
//      element". So we relocate the script to just before </body>.
import { readFileSync, writeFileSync } from 'node:fs'

const file = 'dist-phone/index.html'
let html = readFileSync(file, 'utf8')

const scriptRe = /<script\s+type="module"[^>]*>([\s\S]*?)<\/script>/
const match = html.match(scriptRe)

if (!match) {
  console.warn('[strip-module] No module script found — leaving file unchanged.')
} else {
  const inner = match[1]
  // Remove the original module script from <head>.
  html = html.replace(scriptRe, '')
  // Re-insert as a classic script at the very end of <body>, after #root.
  const classic = `<script>${inner}</script>`
  if (html.includes('</body>')) {
    html = html.replace('</body>', `${classic}</body>`)
  } else {
    html += classic
  }
  writeFileSync(file, html)
  console.log('[strip-module] Converted to classic script and moved to end of <body> for file:// support.')
}
