# UNIQLO 경쟁사 광고 모니터링 웹

설치형 로컬 프로그램이 아니라 Vercel에 배포해 URL로 사용하는 Next.js 웹앱입니다.

## 제공 기능

- 경쟁사 8개 브랜드 관리
- 공식몰 / 네이버 / Meta 광고 라이브러리 / Google 광고 투명성 센터 / Instagram 수집
- Browserless 클라우드 브라우저로 실제 공개 화면 캡처
- 제목·화면 텍스트·원문 링크 추출
- 인지 / 관심·탐색 / 전환 / 리마인드 역할 1차 자동 분류
- 브랜드·채널·역할·키워드 필터
- 브라우저 localStorage에 최근 80개 결과 저장
- 이미지 클릭 및 원문 보기로 실제 페이지 이동

## 왜 Browserless 토큰이 필요한가

Meta·Google·Instagram은 JavaScript로 동적으로 렌더링됩니다. Vercel 함수 안에 Chromium을 직접 설치하는 대신 Browserless의 `/function` API에서 클라우드 브라우저를 실행합니다.

## Vercel 배포

1. 이 폴더를 GitHub 저장소에 업로드합니다.
2. Vercel에서 `Add New → Project`로 저장소를 선택합니다.
3. Environment Variables에 다음을 등록합니다.

```env
BROWSERLESS_TOKEN=발급받은_토큰
BROWSERLESS_ENDPOINT=https://production-sfo.browserless.io
```

4. Deploy를 누릅니다.
5. 배포 완료 후 제공되는 URL로 접속합니다.

## Browserless 토큰

Browserless 계정의 대시보드에서 API 토큰을 발급합니다.

## 로컬 테스트가 필요한 경우에만

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 제약 사항

- 공개 화면만 수집합니다.
- 로그인·CAPTCHA·지역 제한이 필요한 콘텐츠를 우회하지 않습니다.
- Meta와 Google의 DOM 구조가 바뀌면 세부 광고 카드 단위 추출 로직은 조정이 필요합니다.
- 현재 MVP는 검색 결과 화면 단위 캡처입니다. 각 광고 한 건의 이미지·카피·CTA를 별도 레코드로 나누려면 플랫폼별 선택자와 저장 DB를 추가해야 합니다.
- 결과는 현재 사용자의 브라우저 localStorage에 저장됩니다. 여러 사용자가 공유하거나 월별 이력을 영구 보관하려면 Supabase 연결이 필요합니다.
