import path from 'node:path';
import { NextResponse } from 'next/server.js';
import { createGuestbookStore, isRateLimited, parseLimit, validateGuestbookInput } from '../../../src/lib/guestbook.js';

const guestbookFilePath = process.env.GUESTBOOK_FILE_PATH || path.join(process.cwd(), 'data/guestbook.log');
const store = createGuestbookStore({ filePath: guestbookFilePath });

function getIpAddress(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));
    const entries = await store.listLatest(limit);
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Guestbook GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load guestbook.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const ip = getIpAddress(request);
    if (isRateLimited(`guestbook:${ip}`)) {
      return NextResponse.json(
        { success: false, message: 'Please wait a moment before posting again.' },
        { status: 429 }
      );
    }

    const payload = await request.json();
    const normalized = validateGuestbookInput(payload);
    const entry = await store.append(normalized);

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Name') || error.message.includes('Message'))) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    console.error('Guestbook POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to save guestbook entry.' }, { status: 500 });
  }
}
