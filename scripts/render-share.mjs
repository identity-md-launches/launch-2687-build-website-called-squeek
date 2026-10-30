import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('public');
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path === '/share.html') { response.setHeader('Content-Type', 'text/html'); response.end(await readFile('artwork/share-card.html')); return; }
    if (!path.startsWith('/preview/')) { response.writeHead(404).end(); return; }
    const file = resolve(root, path.slice(9));
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', extname(file) === '.woff2' ? 'font/woff2' : 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});
let browser;
try {
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/share.html`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'public/share-card.png' });
  console.log('Generated public/share-card.png (1200 × 630). Rebuild to update dist.');
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
