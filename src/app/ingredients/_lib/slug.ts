/**
 * 재료 slug ↔ API id 변환, 그리고 slug별 표시 메타(emoji 등).
 *
 * 프론트 slug(watermelon) ↔ 백엔드 id(ing_watermelon).
 * emoji는 API가 주지 않으므로 프론트가 매핑한다. 재료가 늘면 EMOJI에 추가.
 */

/** 프론트 slug(watermelon) → API id(ing_watermelon). */
export function toApiId(slug: string): string {
  return `ing_${slug.replace(/-/g, "_")}`;
}

/** 재료 slug → 이모지. API에 없어 프론트가 관리(썸네일 자리표시·헤로 등). */
const EMOJI: Record<string, string> = {
  watermelon: "🍉",
  potato: "🥔",
  "green-onion": "🌿",
  peach: "🍑",
  corn: "🌽",
  cucumber: "🥒",
  onion: "🧅",
  tomato: "🍅",
  cabbage: "🥬",
  tofu: "🧈",
  chicken: "🍗",
  squid: "🦑",
  egg: "🥚",
};

/** slug → 이모지. 매핑 없으면 중립 자리표시. */
export function emojiFor(slug: string): string {
  return EMOJI[slug] ?? "🥗";
}
