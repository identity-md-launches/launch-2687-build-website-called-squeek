import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const html = await readFile('dist/index.html', 'utf8');
for (const marker of ['<title>Squeek Radar', 'rel="icon"', 'name="description"', 'property="og:title"', 'property="og:image"', 'name="twitter:card"']) {
  assert(html.includes(marker), `Missing metadata: ${marker}`);
}
const urls = [...html.matchAll(/(?:src|href|content)="(\.\/[^"#]+)"/g)].map((match) => match[1]);
for (const url of urls) await stat(join('dist', url));
assert(!/(?:src|href)="\/(?!\/)/.test(html), 'Root-absolute asset URL in HTML');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path); else files.push({ path, bytes: (await stat(path)).size });
  }
}
await walk('dist');
const bytes = files.reduce((total, file) => total + file.bytes, 0);
assert(bytes < 1024 * 1024, 'Export exceeds the 1 MiB project target');
for (const file of files.filter((file) => file.path.endsWith('.css'))) {
  const css = await readFile(file.path, 'utf8');
  assert(!/url\(["']?\/fonts/.test(css), 'Root-absolute font URL in CSS');
}
assert(files.some((file) => file.path === 'dist/share-card.png'), 'Missing share card');
assert(files.some((file) => file.path.endsWith('.woff2')), 'Missing local fonts');
console.log(JSON.stringify({ status: 'passed', exportBytes: bytes, files: files.length, relativeAssets: urls, checks: ['metadata', 'local assets present', 'relative HTML and font URLs', 'export under 1 MiB'] }, null, 2));
