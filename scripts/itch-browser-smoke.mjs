import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createReadStream, existsSync, mkdtempSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const archivePath = path.resolve(
  process.env.ITCH_HTML5_ZIP ?? 'AFTERFRAME-THE-LAST-LOOP-itch-html5.zip'
);
assert.ok(existsSync(archivePath), 'Missing itch.io package: ' + archivePath);

const siteRoot = mkdtempSync(path.join(tmpdir(), 'afterframe-itch-html5-'));
execFileSync('unzip', ['-q', archivePath, '-d', siteRoot]);
assert.ok(existsSync(path.join(siteRoot, 'index.html')), 'ZIP root must contain index.html');

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.glb', 'model/gltf-binary'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

const server = createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(siteRoot, relativePath);

    if (filePath !== siteRoot && !filePath.startsWith(siteRoot + path.sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const actualPath = statSync(filePath).isDirectory()
      ? path.join(filePath, 'index.html')
      : filePath;
    response.writeHead(200, {
      'Content-Type': mimeTypes.get(path.extname(actualPath).toLowerCase()) ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    createReadStream(actualPath).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
assert.ok(address && typeof address === 'object');
const baseUrl = 'http://127.0.0.1:' + address.port + '/';

let browser;
const pageErrors = [];
const consoleErrors = [];
const failedLocalRequests = [];
const httpErrors = [];
const requiredModels = [
  'helix_containment_gate.glb',
  'choir_acoustic_organ.glb',
  'curator_archive_monolith.glb',
  'matron_surgical_pod.glb',
];

try {
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
    ],
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (error) => pageErrors.push(error.stack ?? error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(baseUrl)) {
      failedLocalRequests.push({
        url: request.url(),
        error: request.failure()?.errorText ?? 'unknown request failure',
      });
    }
  });
  page.on('response', (response) => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) {
      httpErrors.push({ status: response.status(), url: response.url() });
    }
  });

  const modelWaiters = requiredModels.map((model) =>
    page.waitForResponse(
      (response) => response.url().endsWith('/assets/blender/phase12/' + model),
      { timeout: 30_000 }
    )
  );

  const mainResponse = await page.goto(baseUrl, {
    waitUntil: 'networkidle',
    timeout: 45_000,
  });
  assert.equal(mainResponse?.status(), 200, 'Packaged index.html must return HTTP 200');

  const newCampaign = page.getByTestId('title-btn-new-run');
  await newCampaign.waitFor({ state: 'visible', timeout: 20_000 });
  assert.match(await page.locator('#root').innerText(), /NEW CAMPAIGN/i,
    'React must mount the actual game title screen, not leave an empty root');

  const rendererState = await page.getByTestId('arena-canvas-container').evaluate((container) => {
    const canvas = container.querySelector('canvas');
    if (!canvas) return { canvasPresent: false, webgl2: false, width: 0, height: 0 };
    const context = canvas.getContext('webgl2');
    return {
      canvasPresent: true,
      webgl2: Boolean(context),
      width: canvas.width,
      height: canvas.height,
    };
  });

  assert.equal(rendererState.canvasPresent, true, 'Three.js must append its WebGL canvas');
  assert.equal(rendererState.webgl2, true, 'The browser must create the WebGL2 context required by Three.js');
  assert.ok(rendererState.width > 0 && rendererState.height > 0,
    'The WebGL canvas must have non-zero drawing dimensions');

  await page.screenshot({ path: path.join(tmpdir(), 'afterframe-itch-title.png') });

  const modelResponses = await Promise.all(modelWaiters);
  for (const response of modelResponses) {
    assert.equal(response.status(), 200, 'GLB failed to load: ' + response.url());
  }

  await newCampaign.click();
  await page.waitForFunction(() => document.body.dataset.state === 'playing', null, {
    timeout: 15_000,
  });
  assert.equal(await page.getByTestId('title-btn-new-run').count(), 0,
    'Starting the campaign must replace the title screen');
  await page.screenshot({ path: path.join(tmpdir(), 'afterframe-itch-gameplay.png') });

  assert.deepEqual(failedLocalRequests, [], 'No packaged same-origin asset request may fail');
  assert.deepEqual(httpErrors, [], 'No packaged same-origin request may return HTTP 4xx/5xx');
  assert.deepEqual(pageErrors, [], 'No uncaught browser runtime exception may occur');

  const fatalConsoleErrors = consoleErrors.filter((message) =>
    /Failed to load Blender asset|WebGL.*(error|failed)|Uncaught|TypeError|ReferenceError/i.test(message)
  );
  assert.deepEqual(fatalConsoleErrors, [], 'No fatal game or WebGL error may be logged');

  console.log(JSON.stringify({
    status: 'PASS',
    tested: 'The exact ZIP extracted to a temporary directory and served over HTTP',
    titleScreen: 'React mounted and the New Campaign button is visible',
    renderer: rendererState,
    glbAssets: modelResponses.map((response) => ({
      name: requiredModels.find((model) => response.url().endsWith(model)),
      status: response.status(),
    })),
    gameplayTransition: 'New Campaign click changed body[data-state] to playing',
    pageErrors,
    failedLocalRequests,
    httpErrors,
    consoleErrors,
  }, null, 2));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
