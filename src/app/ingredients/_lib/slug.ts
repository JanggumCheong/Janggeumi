/**
 * 재료 slug ↔ API id 변환, 그리고 slug별 표시 메타(emoji·name).
 *
 * 프론트 slug(watermelon) ↔ 백엔드 id(ing_watermelon).
 * emoji는 API가 안 주고, name은 헤더가 동기로 필요(클라 컴포넌트)해 여기서 매핑한다.
 * 재료가 늘면 META에 추가.
 */

/** 프론트 slug(watermelon) → API id(ing_watermelon). */
export function toApiId(slug: string): string {
  return `ing_${slug.replace(/-/g, "_")}`;
}

/**
 * 재료 slug → 표시 메타(이모지·이름). 헤더 제목·썸네일 등 동기 조회용 매핑.
 * 헤더가 클라 컴포넌트라 async API 조회를 못 해 이름을 여기서 관리한다.
 * 재료가 API에 추가되면 여기에 등록한다(slug = API id에서 ing_ 제거, _→-).
 */
const META: Record<string, { emoji: string; name: string }> = {
  // API 등록 재료 (과일/채소)
  watermelon: { emoji: "🍉", name: "수박" },
  strawberry: { emoji: "🍓", name: "딸기" },
  apple: { emoji: "🍎", name: "사과" },
  "shine-muscat": { emoji: "🍇", name: "샤인머스캣" },
  avocado: { emoji: "🥑", name: "아보카도" },
  peach: { emoji: "🍑", name: "천도복숭아" },
  // 로컬 콘텐츠 재료 (API 미등록)
  potato: { emoji: "🥔", name: "감자" },
  "green-onion": { emoji: "🌿", name: "대파" },
};

/** slug → 이모지. 매핑 없으면 중립 자리표시. */
export function emojiFor(slug: string): string {
  return META[slug]?.emoji ?? "🥗";
}

/** slug → 재료 이름(매핑 fallback). 없으면 null. */
export function nameFor(slug: string): string | null {
  return META[slug]?.name ?? null;
}
