export async function fetchGuestbookEntries(limit = 20) {
  const response = await fetch(`/api/guestbook?limit=${limit}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || 'Failed to load guestbook entries.');
  }

  const body = await response.json();
  return Array.isArray(body.entries) ? body.entries : [];
}

export async function submitGuestbookEntry(payload) {
  const response = await fetch('/api/guestbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || 'Failed to submit guestbook entry.');
  }

  return body.entry;
}
