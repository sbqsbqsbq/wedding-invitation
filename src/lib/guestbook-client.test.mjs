import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchGuestbookEntries, submitGuestbookEntry } from './guestbook-client.js';

test('fetchGuestbookEntries calls API with limit', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    assert.equal(url, '/api/guestbook?limit=20');
    return {
      ok: true,
      json: async () => ({ success: true, entries: [{ id: '1' }] }),
    };
  };

  const entries = await fetchGuestbookEntries(20);
  assert.equal(entries.length, 1);

  global.fetch = originalFetch;
});

test('submitGuestbookEntry throws when request fails', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, json: async () => ({ message: 'bad' }) });

  await assert.rejects(
    async () => submitGuestbookEntry({ name: 'A', message: 'B', locale: 'ko' }),
    /bad/
  );

  global.fetch = originalFetch;
});
