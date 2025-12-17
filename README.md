## Wine Log

Next.js(App Router) + Supabase로 만든 집 와인 셀러/기록 앱입니다.

## Getting Started

### 요구사항

- Node.js 20+
- pnpm

### 환경변수

루트에 `.env.local`을 만들고 아래 값을 설정하세요.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY` (AI 기능 사용 시)
- `OPENAI_MODEL` (선택)

### 개발 서버 실행

의존성 설치 후 개발 서버를 실행합니다.

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열어 확인합니다.

### 프로덕션 빌드

```bash
pnpm build
pnpm start
```

## Supabase

### 마이그레이션

마이그레이션은 `supabase/migrations/`에 있습니다. (로컬 Supabase 사용 시)

```bash
supabase start
supabase db reset
```

### DB 타입 재생성

DB 스키마가 바뀌면 `src/lib/database.types.ts`를 최신으로 갱신하세요.

```bash
supabase gen types typescript --local > src/lib/database.types.ts
```

> Cursor를 쓰는 경우, Supabase MCP의 타입 생성 기능으로도 동일하게 갱신할 수 있습니다.

## 참고

- `jsonb` 컬럼(예: `wines.sommelier_advice`)은 앱에서 `src/lib/sommelier-advice.ts`의 파서/가드를 통해 도메인 타입으로 안전하게 다룹니다.
