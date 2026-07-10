import type { CategoryOption, Ingredient, SeasonalIngredient, SortKey } from "./types";

/* ── Mock 데이터 ────────────────────────────────────────── */
export const CATEGORIES: CategoryOption[] = [
  "전체",
  "채소",
  "과일",
  "육류",
  "수산",
  "유제품",
  "곡류",
];

export const SORTS: SortKey[] = ["인기순", "가나다순"];

export const SEASONAL: SeasonalIngredient[] = [
  {
    slug: "watermelon",
    name: "수박",
    emoji: "🍉",
    rating: 4.7,
    category: "과일",
    inSeason: true,
    season: "6·8월",
  },
  {
    slug: "corn",
    name: "옥수수",
    emoji: "🌽",
    rating: 4.6,
    category: "곡류",
    inSeason: true,
    season: "6·9월",
  },
  {
    slug: "peach",
    name: "복숭아",
    emoji: "🍑",
    rating: 4.5,
    category: "과일",
    inSeason: true,
    season: "6·8월",
  },
  {
    slug: "cucumber",
    name: "오이",
    emoji: "🥒",
    rating: 4.4,
    category: "채소",
    inSeason: true,
    season: "4·9월",
  },
];

export const HOTS: SeasonalIngredient[] = [
  {
    slug: "corn",
    name: "옥수수",
    emoji: "🌽",
    rating: 4.6,
    category: "곡류",
    inSeason: true,
    season: "6·9월",
  },
  {
    slug: "watermelon",
    name: "수박",
    emoji: "🍉",
    rating: 4.7,
    category: "과일",
    inSeason: true,
    season: "6·8월",
  },
  {
    slug: "peach",
    name: "복숭아",
    emoji: "🍑",
    rating: 4.5,
    category: "과일",
    inSeason: true,
    season: "6·8월",
  },
  {
    slug: "cucumber",
    name: "오이",
    emoji: "🥒",
    rating: 4.4,
    category: "채소",
    inSeason: true,
    season: "4·9월",
  },
];

/**
 * 검색 가데이터. 과일(FRUIT)만 검색 API가 있으므로, 과일이 아닌 카테고리는
 * 이 목데이터로 검색 결과에 "노출만" 시킨다(상세 이동 불가 → comingSoon).
 * 과일은 API에서 오므로 여기 넣지 않는다(전체 검색 시 중복 방지).
 */
export const INGREDIENTS: Ingredient[] = [
  { slug: "onion", name: "양파", emoji: "🧅", rating: 4.6, category: "채소", inSeason: false },
  { slug: "potato", name: "감자", emoji: "🥔", rating: 4.5, category: "채소", inSeason: false },
  {
    slug: "green-onion",
    name: "대파",
    emoji: "🌿",
    rating: 4.6,
    category: "채소",
    inSeason: false,
  },
  { slug: "tomato", name: "토마토", emoji: "🍅", rating: 4.7, category: "채소", inSeason: true },
  { slug: "zucchini", name: "애호박", emoji: "🥒", rating: 4.5, category: "채소", inSeason: true },
  { slug: "eggplant", name: "가지", emoji: "🍆", rating: 4.6, category: "채소", inSeason: true },
  { slug: "cabbage", name: "양배추", emoji: "🥬", rating: 4.5, category: "채소", inSeason: false },
  { slug: "tofu", name: "두부", emoji: "🧈", rating: 4.5, category: "유제품", inSeason: false },
  { slug: "chicken", name: "닭고기", emoji: "🍗", rating: 4.6, category: "육류", inSeason: false },
  { slug: "squid", name: "오징어", emoji: "🦑", rating: 4.5, category: "수산", inSeason: false },
  { slug: "egg", name: "계란", emoji: "🥚", rating: 4.6, category: "유제품", inSeason: false },
];

/**
 * 과일 슬러그 → 이모지. 검색 API는 이모지를 주지 않으므로 여기서 매핑한다.
 * API에 과일이 추가되면 여기에 등록한다(없으면 중립 자리표시).
 */
export const FRUIT_EMOJI: Record<string, string> = {
  strawberry: "🍓",
  apple: "🍎",
  "shine-muscat": "🍇",
  watermelon: "🍉",
  avocado: "🥑",
  peach: "🍑",
  persimmon: "🍊",
  mandarin: "🍊",
  lemon: "🍋",
  mango: "🥭",
  melon: "🍈",
  fig: "🫐",
  banana: "🍌",
  "cherry-tomato": "🍅",
  pear: "🍐",
  blueberry: "🫐",
  pomegranate: "🍎",
  orange: "🍊",
  plum: "🍑",
  grapefruit: "🍊",
  "oriental-melon": "🍈",
  "green-grape": "🍇",
  cherry: "🍒",
  kiwi: "🥝",
  pineapple: "🍍",
  grape: "🍇",
};
