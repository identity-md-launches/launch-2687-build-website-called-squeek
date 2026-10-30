import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const customModule = process.argv.find((value) => value.startsWith('--playwright='))?.split('=').slice(1).join('=');
const { chromium, webkit } = await import(customModule ? pathToFileURL(resolve(customModule)).href : 'playwright');
const fixture = await readFile('test/fixtures/sepolia.json', 'utf8');
const root = resolve('dist');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith('/preview/')) { response.writeHead(404).end(); return; }
    const file = resolve(root, pathname.slice(9) || 'index.html');
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}/preview/`;
const results = [];
let browser;
async function record(name, fn) {
  await fn();
  results.push({ name, passed: true });
  console.log(`PASS ${name}`);
}
async function waitForText(page, selector, text) {
  await page.locator(selector).filter({ hasText: text }).first().waitFor();
}
try {
  const engines = process.argv.includes('--chromium-only') ? [['Chromium', chromium]] : [['Chromium', chromium], ['WebKit', webkit]];
  for (const [name, engine] of engines) {
    browser = await engine.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.clock.install();
    const errors = [];
    const badResources = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.url().startsWith(base) && response.status() >= 400) badResources.push(response.url()); });
    await page.route('**/api/v2/transactions?*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: fixture }));
    await page.goto(base);
    await waitForText(page, '#activity-heading', 'Live network data');
    await page.evaluate(() => document.fonts.ready);
    await record(`${name}: production assets, fonts, and live fixture`, async () => {
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.transaction-row').count(), 5);
      assert(await page.evaluate(() => document.fonts.check('400 16px "DM Sans"') && document.fonts.check('400 16px Silkscreen')));
      assert.deepEqual(errors, []);
      assert.deepEqual(badResources, []);
    });
    await record(`${name}: seed adds six turns and boosts the wheel`, async () => {
      const before = Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
      await page.getByRole('button', { name: 'Give a seed' }).click();
      assert.equal(Number(await page.getByRole('progressbar').getAttribute('aria-valuenow')), (before + 6) % 100);
      assert.equal(await page.locator('.seed-metric strong').innerText(), '01');
      assert.match(await page.locator('.wheel-metric').first().innerText(), /36/);
      await page.clock.fastForward(9000);
      await waitForText(page, '.wheel-metric', '12');
      assert.match(await page.locator('.wheel-metric').first().innerText(), /12/);
    });
    await record(`${name}: pause freezes progress and resumes`, async () => {
      await page.getByRole('button', { name: 'Pause simulation' }).click();
      const before = await page.getByRole('progressbar').getAttribute('aria-valuenow');
      await page.clock.fastForward(11000);
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'), before);
      assert.match(await page.locator('.wheel-metric').first().innerText(), /0/);
      await page.getByRole('button', { name: 'Resume simulation' }).click();
      await page.clock.fastForward(5100);
      assert.equal(Number(await page.getByRole('progressbar').getAttribute('aria-valuenow')), (Number(before) + 1) % 100);
    });
    await record(`${name}: batch completes after enough seeds`, async () => {
      const before = await page.locator('.status-card').nth(1).innerText();
      for (let index = 0; index < 17; index++) await page.getByRole('button', { name: 'Give a seed' }).click();
      assert.notEqual(await page.locator('.status-card').nth(1).innerText(), before);
    });
    await record(`${name}: feed filters, more activity, transaction details`, async () => {
      await page.getByRole('button', { name: 'Show more activity', exact: true }).click();
      assert.equal(await page.locator('.transaction-row').count(), 10);
      await page.getByRole('button', { name: 'Contract calls', exact: true }).click();
      for (const label of await page.locator('.tx-kind').allTextContents()) assert.match(label, /Contract/);
      await page.locator('.transaction-row').first().click();
      assert.equal(await page.locator('.detail-dialog').evaluate((node) => node.open), true);
      const hash = await page.locator('.full-hash').first().innerText();
      assert.match(hash, /^0x[\da-f]{64}$/i);
      assert.equal(await page.getByRole('link', { name: 'View on Blockscout' }).getAttribute('href'), `https://eth-sepolia.blockscout.com/tx/${hash}`);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.detail-dialog').evaluate((node) => node.open), false);
      assert(await page.locator('.transaction-row').first().evaluate((node) => node === document.activeElement));
    });
    await record(`${name}: About route, focus, and back navigation`, async () => {
      await page.getByRole('link', { name: 'About', exact: true }).click();
      assert.match(await page.locator('h1').innerText(), /Powered by tiny paws/);
      assert(await page.locator('h1').evaluate((node) => node === document.activeElement));
      assert.match(await page.locator('.about-intro p').innerText(), /hamster-powered toychain on Ethereum/);
      await page.getByRole('link', { name: 'Give Squeek a seed' }).click();
      await page.getByRole('button', { name: 'Give a seed' }).waitFor();
    });
    await record(`${name}: share dialog, Escape, and focus restoration`, async () => {
      await page.getByRole('button', { name: 'Share Squeek Radar' }).click();
      assert(await page.locator('.share-dialog').evaluate((node) => node.open));
      const share = await page.getByRole('link', { name: 'Share on X' }).getAttribute('href');
      assert.equal(new URL(share).hostname, 'twitter.com');
      assert.equal(new URL(share).searchParams.get('url'), base);
      assert(await page.locator('.share-preview').evaluate((node) => node.complete && node.naturalWidth === 1200));
      await page.keyboard.press('Escape');
      assert(await page.getByRole('button', { name: 'Share Squeek Radar' }).evaluate((node) => node === document.activeElement));
    });
    await record(`${name}: 320, 390, 768, 1024, 1440 reflow; mobile main action`, async () => {
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => scrollTo(0, 0));
        const size = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }));
        assert(size.page <= size.view, `${width}px overflows: ${JSON.stringify(size)}`);
        if (width === 390) {
          const box = await page.getByRole('button', { name: 'Give a seed' }).boundingBox();
          assert(box && box.y >= 0 && box.y + box.height < 844, 'Main action is below first screen');
        }
        assert(await page.getByRole('button', { name: 'Share Squeek Radar' }).isVisible());
      }
    });
    await record(`${name}: reduced motion stops endless animation`, async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('.wheel-spokes').evaluate((node) => getComputedStyle(node).animationName), 'none');
      assert.equal(await page.locator('.running-hamster').evaluate((node) => getComputedStyle(node).animationName), 'none');
    });
    await record(`${name}: unavailable API falls back honestly; retry recovers`, async () => {
      await page.unroute('**/api/v2/transactions?*');
      await page.route('**/api/v2/transactions?*', (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      await waitForText(page, '#activity-heading', 'Sample data');
      await page.locator('.transaction-row').first().click();
      assert.match(await page.locator('.detail-dialog p').innerText(), /no onchain transaction/);
      assert.equal(await page.getByRole('link', { name: 'View on Blockscout' }).count(), 0);
      await page.keyboard.press('Escape');
      await page.unroute('**/api/v2/transactions?*');
      await page.route('**/api/v2/transactions?*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: fixture }));
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      await waitForText(page, '#activity-heading', 'Live network data');
    });
    await record(`${name}: empty response offers recovery; malformed data falls back`, async () => {
      await page.unroute('**/api/v2/transactions?*');
      await page.route('**/api/v2/transactions?*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[]}' }));
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      await waitForText(page, '.feed-empty', 'No transactions');
      assert(await page.getByRole('button', { name: 'Show all activity and refresh' }).isVisible());
      await page.unroute('**/api/v2/transactions?*');
      await page.route('**/api/v2/transactions?*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"unexpected":"response"}' }));
      await page.getByRole('button', { name: 'Show all activity and refresh' }).click();
      await waitForText(page, '#activity-heading', 'Sample data');
    });
    await record(`${name}: loading is visible and a timed-out request falls back`, async () => {
      await page.unroute('**/api/v2/transactions?*');
      await page.route('**/api/v2/transactions?*', () => {});
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      assert(await page.getByRole('button', { name: 'Refreshing', exact: true }).isDisabled());
      assert.match(await page.locator('.feed-notice').innerText(), /Fetching/);
      await page.clock.fastForward(7000);
      await waitForText(page, '#activity-heading', 'Sample data');
      assert(await page.getByRole('button', { name: 'Refresh', exact: true }).isEnabled());
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(badResources, []);
    await browser.close();
    browser = null;
  }
  console.log(JSON.stringify({ status: 'passed', checks: results.length, results }, null, 2));
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
