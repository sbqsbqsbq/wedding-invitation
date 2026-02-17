# RSVP Google Sheets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** RSVP 섹션을 활성화하고, 제출 데이터를 Google Apps Script를 통해 Google Sheets에 저장한다.

**Architecture:** 클라이언트는 기존 `RsvpSection`에서 `/api/rsvp`로 제출한다. API 라우트는 입력을 검증한 뒤 `GOOGLE_SHEETS_WEBHOOK_URL`로 POST하고, 응답 결과를 기준으로 상태 코드를 반환한다. 설정은 `wedding-config.ts`에서 토글 가능하게 유지한다.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Google Apps Script Webhook

---

### Task 1: 테스트 러너(Vitest) 최소 구성

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`

**Step 1: Write the failing test**

```ts
// app/api/rsvp/route.test.ts (임시 스모크 테스트)
import { describe, expect, it } from 'vitest';

describe('test setup', () => {
  it('runs vitest', () => {
    expect(true).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/rsvp/route.test.ts`  
Expected: FAIL with "Cannot find module 'vitest'" or test command not found

**Step 3: Write minimal implementation**

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
});
```

```ts
// test/setup.ts
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/api/rsvp/route.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts test/setup.ts app/api/rsvp/route.test.ts
git commit -m "test: add vitest setup for API route tests"
```

### Task 2: RSVP API 입력 검증 테스트 작성

**Files:**
- Create: `app/api/rsvp/route.test.ts`
- Modify: `app/api/rsvp/route.ts` (아직 구현 전, 테스트 먼저)

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { POST } from './route';

describe('POST /api/rsvp validation', () => {
  it('returns 400 when required fields are missing', async () => {
    const request = new Request('http://localhost/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', side: '', isAttending: null }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/api/rsvp/route.test.ts`  
Expected: FAIL because route currently returns 200/500 only

**Step 3: Write minimal implementation**

```ts
// route.ts 내부
if (!name || !side || typeof isAttending !== 'boolean') {
  return NextResponse.json({ success: false, message: '필수값 누락' }, { status: 400 });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/api/rsvp/route.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add app/api/rsvp/route.ts app/api/rsvp/route.test.ts
git commit -m "test(api): validate required RSVP fields"
```

### Task 3: Google Sheets 설정 누락 테스트 및 구현

**Files:**
- Modify: `src/config/wedding-config.ts`
- Modify: `app/api/rsvp/route.ts`
- Modify: `app/api/rsvp/route.test.ts`

**Step 1: Write the failing test**

```ts
it('returns 500 when Google Sheets webhook is not configured', async () => {
  // weddingConfig.googleSheets.enabled = true, webAppUrl = ''
  const request = new Request('http://localhost/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '홍길동',
      side: '신랑측',
      isAttending: true,
      guestCount: 2,
      hasMeal: true,
    }),
  });

  const response = await POST(request);
  expect(response.status).toBe(500);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/api/rsvp/route.test.ts`  
Expected: FAIL (currently config 누락 처리 없음)

**Step 3: Write minimal implementation**

```ts
// wedding-config.ts
googleSheets: {
  enabled: true,
  webAppUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || '',
},
```

```ts
// route.ts
if (weddingConfig.googleSheets.enabled && !weddingConfig.googleSheets.webAppUrl) {
  return NextResponse.json(
    { success: false, message: 'Google Sheets 설정이 누락되었습니다.' },
    { status: 500 }
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/api/rsvp/route.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/config/wedding-config.ts app/api/rsvp/route.ts app/api/rsvp/route.test.ts
git commit -m "feat(api): add Google Sheets configuration guard"
```

### Task 4: Google Sheets 전송 성공/실패 테스트 및 구현

**Files:**
- Modify: `app/api/rsvp/route.ts`
- Modify: `app/api/rsvp/route.test.ts`

**Step 1: Write the failing test**

```ts
it('returns 200 when Google Sheets webhook accepts payload', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => 'ok' })
  );
  // valid request...
  const response = await POST(request);
  expect(response.status).toBe(200);
});

it('returns 502 when Google Sheets webhook fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'error' })
  );
  // valid request...
  const response = await POST(request);
  expect(response.status).toBe(502);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/api/rsvp/route.test.ts`  
Expected: FAIL (현재 Slack 로직으로 분기 불일치)

**Step 3: Write minimal implementation**

```ts
const sheetResponse = await fetch(weddingConfig.googleSheets.webAppUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

if (!sheetResponse.ok) {
  return NextResponse.json(
    { success: false, message: '참석 여부 저장에 실패했습니다.' },
    { status: 502 }
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/api/rsvp/route.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add app/api/rsvp/route.ts app/api/rsvp/route.test.ts
git commit -m "feat(api): send RSVP payload to Google Sheets webhook"
```

### Task 5: RSVP 섹션 활성화 및 문서 업데이트

**Files:**
- Modify: `src/config/wedding-config.ts`
- Modify: `README.md`

**Step 1: Write the failing test**

```ts
// 설정 파일 검증 테스트가 없으면 스냅샷/정적 검증 대신 문서 체크리스트를 실패조건으로 간주
// 수동 검증 체크: 메인 페이지에서 RSVP 섹션이 렌더링되지 않으면 실패
```

**Step 2: Run test to verify it fails**

Run: `npm run dev` 후 모바일 화면 확인  
Expected: RSVP 섹션 미노출(현재 enabled=false)

**Step 3: Write minimal implementation**

```ts
// wedding-config.ts
rsvp: {
  enabled: true,
  showMealOption: false,
},
```

README에 추가:
- `GOOGLE_SHEETS_WEBHOOK_URL` 환경변수 설명
- Apps Script `doPost` 예시
- 시트 컬럼 순서 정의

**Step 4: Run test to verify it passes**

Run: `npm run dev` 후 확인, `npm test -- app/api/rsvp/route.test.ts`  
Expected: RSVP 섹션 노출 + API 테스트 PASS

**Step 5: Commit**

```bash
git add src/config/wedding-config.ts README.md
git commit -m "feat: enable RSVP section and document Google Sheets setup"
```

### Task 6: 최종 검증

**Files:**
- Modify: 없음

**Step 1: Write the failing test**

```ts
// 없음 (통합 검증 단계)
```

**Step 2: Run test to verify it fails**

Run: `npm run lint`  
Expected: FAIL 시 수정 필요

**Step 3: Write minimal implementation**

```ts
// lint/test 실패 원인만 최소 수정
```

**Step 4: Run test to verify it passes**

Run:
- `npm run lint`
- `npm test -- app/api/rsvp/route.test.ts`

Expected: 모두 PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: finalize RSVP Google Sheets integration"
```
