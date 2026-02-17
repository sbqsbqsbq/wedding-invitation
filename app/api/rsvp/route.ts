import { NextResponse } from 'next/server';
import { weddingConfig } from '../../../src/config/wedding-config';

const allowedSides = new Set(['신부측', '신랑측']);

const formatKoreanTime = (timestamp?: string) => {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, side, isAttending, guestCount, hasMeal, timestamp } = data ?? {};

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedIsAttending = typeof isAttending === 'boolean' ? isAttending : null;
    const normalizedSide = typeof side === 'string' ? side : '';
    const normalizedGuestCount =
      typeof guestCount === 'number' && Number.isFinite(guestCount) ? guestCount : 0;
    const normalizedHasMeal = typeof hasMeal === 'boolean' ? hasMeal : false;

    if (!normalizedName || normalizedIsAttending === null || !allowedSides.has(normalizedSide)) {
      return NextResponse.json(
        { success: false, message: '이름, 참석 여부, 신부/신랑측 여부를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!weddingConfig.googleSheets.enabled || !weddingConfig.googleSheets.webAppUrl) {
      return NextResponse.json(
        { success: false, message: 'Google Sheets 연동 설정이 누락되었습니다.' },
        { status: 500 }
      );
    }

    const payload = {
      submittedAtKst: formatKoreanTime(timestamp),
      name: normalizedName,
      side: normalizedSide,
      isAttending: normalizedIsAttending,
      guestCount: normalizedIsAttending ? Math.max(1, normalizedGuestCount) : 0,
      hasMeal: normalizedIsAttending ? normalizedHasMeal : false,
      channel: 'web',
    };

    const sheetResponse = await fetch(weddingConfig.googleSheets.webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!sheetResponse.ok) {
      const errorText = await sheetResponse.text();
      console.error('Google Sheets 저장 실패:', sheetResponse.status, errorText);
      return NextResponse.json(
        { success: false, message: '참석 여부 저장에 실패했습니다. 다시 시도해 주세요.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('RSVP 처리 오류:', error);
    return NextResponse.json({
      success: false,
      message: 'RSVP 처리 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}
