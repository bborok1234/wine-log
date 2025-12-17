# Migration log (Supabase)

이 프로젝트는 Supabase Postgres 마이그레이션을 `supabase/migrations/`에 SQL로 기록합니다.

## 현재 적용된 마이그레이션(프로젝트 DB 기준)
- `20251216063402_0001_init_tables_triggers.sql`
  - 테이블/인덱스/트리거(구매 insert 시 재고/평균가 갱신) 생성
  - 하우스 생성 시 owner 멤버 자동 등록 트리거는 SECURITY DEFINER로 실행(RLS로 트리거 내부 INSERT가 막히는 이슈 방지)
- `20251216063436_0002_init_rls_policies.sql`
  - RLS 활성화 + 정책/헬퍼 함수 생성
  - `houses` INSERT 정책에 created_by 기본값 타이밍 이슈 대응(초기 파일에 흡수)
  - `houses` SELECT 정책에 created_by(생성자) 허용 추가(하우스 생성 시 owner 멤버 자동 등록 트리거와의 순환 해소)
  - `house_invites` INSERT 정책에 created_by 기본값 타이밍 이슈 대응
- `20251216063449_0003_init_rpcs.sql`
  - RPC: `rpc_open_bottle`, `rpc_create_invite`, `rpc_accept_invite`

## 정리(제안)
- **RPC를 프로젝트 정책상 쓰지 않기로 결정**하면,
  - `rpc_open_bottle`도 굳이 RPC 없이 `update ... where stock_qty > 0 returning ...`로 대체 가능합니다.
  - 다만 현재 V1은 서버 액션에서 RPC를 호출하도록 되어 있어(`rpc_open_bottle`) 유지했습니다.


