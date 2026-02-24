import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseLimit,
  sanitizeField,
  validateGuestbookInput,
  createGuestbookStore,
} from './guestbook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempLogFile = path.join(__dirname, '../../data/guestbook-test.log');

test('sanitizeField removes control chars and trims', () => {
  const value = sanitizeField('  hi\u0000 there\n  ');
  assert.equal(value, 'hi there');
});

test('validateGuestbookInput rejects empty name/message', () => {
  assert.throws(() => validateGuestbookInput({ name: ' ', message: 'hello', locale: 'ko' }));
  assert.throws(() => validateGuestbookInput({ name: 'A', message: ' ', locale: 'en' }));
});

test('parseLimit uses default and cap', () => {
  assert.equal(parseLimit(undefined), 20);
  assert.equal(parseLimit('abc'), 20);
  assert.equal(parseLimit('60'), 50);
  assert.equal(parseLimit('10'), 10);
});

test('store appends and returns latest entries', async () => {
  await fs.rm(tempLogFile, { force: true });
  const store = createGuestbookStore({ filePath: tempLogFile });

  await store.append({ name: 'Alice', message: 'First', locale: 'en' });
  await store.append({ name: 'Bob', message: 'Second', locale: 'ko' });

  const entries = await store.listLatest(2);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].name, 'Bob');
  assert.equal(entries[1].name, 'Alice');

  await fs.rm(tempLogFile, { force: true });
});
