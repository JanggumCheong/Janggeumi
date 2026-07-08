/**
 * 탭 콘텐츠 로딩 스켈레톤 (구매·보관·처리).
 *
 * page(IngredientTabPage)가 진입·탭 전환마다 API 3종을 no-store로 await 하는 동안
 * loading.tsx가 이 스켈레톤을 스트리밍한다. 탭마다 실제 레이아웃이 완전히 다르므로
 * (구매=게이지+2컬럼+기준그리드 / 보관=필터+방법리스트 / 처리=세그먼트+레시피피드)
 * 탭별로 형태를 맞춰 전환 시 레이아웃 시프트를 없앤다.
 *
 * 히어로(HeroSpeaker, 132px)는 세 탭 공통이라 HeroSkeleton으로 재사용한다.
 * 치수는 실제 렌더를 측정해 맞췄다 — 스켈레톤↔실콘텐츠 교체 시 흔들림 최소화.
 */
import type { IngredientTab } from "../../_lib/types";

export function TabSkeleton({ tab }: { tab: IngredientTab }) {
  return (
    <div aria-busy="true" aria-label="불러오는 중" className="flex animate-pulse flex-col gap-4">
      <HeroSkeleton />
      {tab === "purchase" && <PurchaseSkeleton />}
      {tab === "storage" && <StorageSkeleton />}
      {tab === "handling" && <HandlingSkeleton />}
    </div>
  );
}

/** 세 탭 공통 히어로 — 화자칩 → h1 → 큰 카피 2줄 → 보조문구. */
function HeroSkeleton() {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <div className="size-[22px] rounded-full bg-muted" />
        <div className="h-3 w-16 rounded-full bg-muted" />
      </div>
      <div className="h-3 w-28 rounded-full bg-muted" />
      <div className="mt-2 h-7 w-52 rounded-full bg-muted" />
      <div className="mt-1.5 h-7 w-64 rounded-full bg-muted" />
      <div className="mt-2.5 h-4 w-44 rounded-full bg-muted" />
    </div>
  );
}

/** 구매 = 확률 게이지 카드 → 좋다/피하라 2컬럼 → 기준 2×N 그리드 → 출처. */
function PurchaseSkeleton() {
  return (
    <>
      {/* 확률 게이지 카드 */}
      <div className="rounded-[20px] border border-border bg-card p-4">
        <div className="h-3.5 w-40 rounded-full bg-muted" />
        <div className="mt-1.5 h-8 w-24 rounded-full bg-muted" />
        <div className="mt-2.5 h-[9px] w-full rounded-full bg-muted" />
        <div className="mt-2 h-3 w-28 rounded-full bg-muted" />
      </div>

      {/* 좋다 / 피하라 2컬럼 */}
      <div className="flex gap-2.5">
        <div className="h-40 flex-1 rounded-[16px] border border-border bg-muted" />
        <div className="h-40 flex-1 rounded-[16px] border border-border bg-muted" />
      </div>

      {/* 기준 체크리스트 2컬럼 그리드 */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-border bg-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 bg-card p-4">
            <div className="h-4 w-24 rounded-full bg-muted" />
            <div className="h-3 w-full rounded-full bg-muted" />
            <div className="h-3 w-4/5 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </>
  );
}

/** 보관 = 필터 pill 3개 → 방법 리스트(카드 안 방법 4행) → 팁. */
function StorageSkeleton() {
  return (
    <>
      {/* 필터 pill 3개 */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-[93px] rounded-full bg-muted" />
        ))}
      </div>

      {/* 방법 리스트 카드 — 내부에 방법 4개 */}
      <div className="rounded-[20px] border border-border bg-card p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-2 py-4 not-first:border-t not-first:border-border">
            <div className="size-16 flex-none rounded-[16px] bg-muted" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-32 rounded-full bg-muted" />
              <div className="flex gap-1.5">
                <div className="h-5 w-12 rounded-full bg-muted" />
                <div className="h-5 w-12 rounded-full bg-muted" />
                <div className="h-5 w-12 rounded-full bg-muted" />
              </div>
              <div className="h-3 w-full rounded-full bg-muted" />
              <div className="h-3 w-3/4 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* 장금이 팁 */}
      <div className="h-20 rounded-[16px] bg-secondary" />
    </>
  );
}

/** 처리 = 활용/폐기 세그먼트 → 정렬 헤더 → 레시피 카드 4행 → CTA. */
function HandlingSkeleton() {
  return (
    <>
      {/* 활용/폐기 세그먼트 */}
      <div className="flex gap-2 rounded-full bg-muted p-1">
        <div className="h-9 flex-1 rounded-full bg-card" />
        <div className="h-9 flex-1 rounded-full bg-transparent" />
      </div>

      {/* 정렬 헤더 (개수 + 정렬 드롭다운) */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 rounded-full bg-muted" />
        <div className="h-9 w-24 rounded-full bg-muted" />
      </div>

      {/* 레시피 피드 카드 — 내부에 레시피 4행 */}
      <div className="rounded-[20px] border border-border bg-card p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-2 py-3.5 not-first:border-t not-first:border-border">
            <div className="size-[76px] flex-none rounded-[16px] bg-muted" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-28 rounded-full bg-muted" />
              <div className="h-3 w-full rounded-full bg-muted" />
              <div className="mt-1 flex items-center gap-2">
                <div className="size-5 rounded-full bg-muted" />
                <div className="h-3 w-20 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 만들기 CTA */}
      <div className="h-12 rounded-[16px] bg-muted" />
    </>
  );
}
