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
  // API 등록 재료 (과일)
  watermelon: { emoji: "🍉", name: "수박" },
  strawberry: { emoji: "🍓", name: "딸기" },
  apple: { emoji: "🍎", name: "사과" },
  "shine-muscat": { emoji: "🍇", name: "샤인머스캣" },
  avocado: { emoji: "🥑", name: "아보카도" },
  peach: { emoji: "🍑", name: "천도복숭아" },
  persimmon: { emoji: "🟠", name: "감" },
  mandarin: { emoji: "🍊", name: "귤" },
  lemon: { emoji: "🍋", name: "레몬" },
  mango: { emoji: "🥭", name: "망고" },
  melon: { emoji: "🍈", name: "멜론" },
  fig: { emoji: "🫒", name: "무화과" },
  banana: { emoji: "🍌", name: "바나나" },
  "cherry-tomato": { emoji: "🍅", name: "방울토마토" },
  pear: { emoji: "🍐", name: "배" },
  blueberry: { emoji: "🫐", name: "블루베리" },
  pomegranate: { emoji: "🔴", name: "석류" },
  orange: { emoji: "🍊", name: "오렌지" },
  plum: { emoji: "🟣", name: "자두" },
  grapefruit: { emoji: "🍊", name: "자몽" },
  "oriental-melon": { emoji: "🍈", name: "참외" },
  "green-grape": { emoji: "🍇", name: "청포도" },
  cherry: { emoji: "🍒", name: "체리" },
  kiwi: { emoji: "🥝", name: "키위" },
  pineapple: { emoji: "🍍", name: "파인애플" },
  grape: { emoji: "🍇", name: "포도" },
  // 로컬 콘텐츠 재료 (API 미등록)
  potato: { emoji: "🥔", name: "감자" },
  "green-onion": { emoji: "🌿", name: "대파" },
  // 발화 안내로 자주 뜨는 채소 (API·로컬 미등록 — 이름만이라도)
  corn: { emoji: "🌽", name: "옥수수" },
  cucumber: { emoji: "🥒", name: "오이" },
  onion: { emoji: "🧅", name: "양파" },
  tomato: { emoji: "🍅", name: "토마토" },
  cabbage: { emoji: "🥬", name: "양배추" },
  carrot: { emoji: "🥕", name: "당근" },
  garlic: { emoji: "🧄", name: "마늘" },
};

/** slug → 이모지. 매핑 없으면 중립 자리표시. */
export function emojiFor(slug: string): string {
  return META[slug]?.emoji ?? "🥗";
}

/** slug → 재료 이름(매핑 fallback). 없으면 null. */
export function nameFor(slug: string): string | null {
  return META[slug]?.name ?? null;
}
