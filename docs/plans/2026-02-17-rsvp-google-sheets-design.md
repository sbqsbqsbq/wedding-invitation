# RSVP Google Sheets 연동 설계 문서

## 목표
- 모바일 청첩장에서 RSVP(참석 여부) 섹션을 활성화한다.
- RSVP 제출 데이터를 Slack 대신 Google Sheets에 저장한다.

## 범위
- 프론트엔드 RSVP 입력 UI는 기존 구조를 유지한다.
- 백엔드 API(`/api/rsvp`)는 입력 검증 후 Google Apps Script Web App으로 데이터를 전송한다.
- 저장 대상은 Google Sheets이며, 저장 성공 시에만 사용자에게 성공 응답을 반환한다.

## 비범위
- 관리자 조회 페이지 구축
- DB 영구 저장소 추가
- 스팸 방지(캡차/레이트리밋) 고도화

## 아키텍처
1. 사용자: `RsvpSection` 폼 입력 후 제출
2. 서버: `POST /api/rsvp`에서 요청 검증 및 정규화
3. 서버: 환경변수로 설정된 Apps Script Web App URL로 JSON 전송
4. Apps Script: Google Sheets에 append
5. 서버: 결과에 따라 클라이언트에 성공/실패 응답

## 데이터 스키마
- 접수시각(KST)
- 이름
- 구분(신랑측/신부측)
- 참석여부
- 참석인원
- 식사여부
- 접수채널(웹)

## 변경 파일
- `src/config/wedding-config.ts`
  - `rsvp.enabled`를 `true`로 변경
  - `googleSheets` 설정 추가(`enabled`, `webAppUrl`)
- `app/api/rsvp/route.ts`
  - Slack 전송 제거
  - 입력 검증 및 Apps Script POST 연동
  - 상태 코드: 400(입력 오류), 500(설정 누락), 502(시트 저장 실패), 200(성공)
- `README.md`
  - Google Apps Script 연동 방법, 환경변수 설정, 시트 컬럼 구조 문서화

## 에러 처리 원칙
- 입력 누락/형식 오류는 즉시 400 반환
- Web App URL 미설정은 500 반환
- Apps Script 응답 실패 또는 네트워크 실패는 502 반환
- 클라이언트는 기존 실패 메시지 UX를 유지한다.

## 테스트 전략
- API 라우트 단위 테스트(TDD) 추가
  - 필수값 누락 -> 400
  - Webhook URL 미설정 -> 500
  - 정상 전송 -> 200
  - Apps Script 실패 응답 -> 502
- 테스트 러너가 없으면 `vitest` 최소 설정으로 도입한다.
