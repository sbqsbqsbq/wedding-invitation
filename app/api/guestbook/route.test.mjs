import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempFile = path.join(__dirname, '../../../data/guestbook-route-test.log');

process.env.GUESTBOOK_FILE_PATH = tempFile;

const routeModule = await import('./route.js');
const { GET, POST } = routeModule;

test('POST valid payload returns 200 and entry', async () => {
  await fs.rm(tempFile, { force: true });
  const req = new Request('http://localhost/api/guestbook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
    body: JSON.stringify({ name: 'Alice', message: 'Hello there', locale: 'en' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.entry.name, 'Alice');
});

test('POST invalid payload returns 400', async () => {
  const req = new Request('http://localhost/api/guestbook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.0.0.2' },
    body: JSON.stringify({ name: ' ', message: 'x', locale: 'ko' }),
  });

  const res = await POST(req);
  assert.equal(res.status, 400);
});

test('POST rate-limited returns 429', async () => {
  const headers = { 'content-type': 'application/json', 'x-forwarded-for': '10.0.0.3' };
  const first = await POST(new Request('http://localhost/api/guestbook', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Bob', message: 'First', locale: 'en' }),
  }));
  assert.equal(first.status, 200);

  const second = await POST(new Request('http://localhost/api/guestbook', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Bob', message: 'Second', locale: 'en' }),
  }));
  assert.equal(second.status, 429);
});

test('GET limit and cap behavior', async () => {
  await POST(new Request('http://localhost/api/guestbook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.0.0.4' },
    body: JSON.stringify({ name: 'Chris', message: 'One', locale: 'ko' }),
  }));

  const defaultRes = await GET(new Request('http://localhost/api/guestbook'));
  assert.equal(defaultRes.status, 200);
  const defaultBody = await defaultRes.json();
  assert.equal(Array.isArray(defaultBody.entries), true);

  const cappedRes = await GET(new Request('http://localhost/api/guestbook?limit=999'));
  assert.equal(cappedRes.status, 200);
  const cappedBody = await cappedRes.json();
  assert.equal(Array.isArray(cappedBody.entries), true);

  await fs.rm(tempFile, { force: true });
});
