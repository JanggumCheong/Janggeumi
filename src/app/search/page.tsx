"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

/* ── Mock 데이터 ────────────────────────────────────────── */
type Category = "채소" | "과일" | "육류" | "수산" | "유제품" | "곡류";
const CATEGORIES: Array<"전체" | Category> = [
  "전체",
  "채소",
  "과일",
  "육류",
  "수산",
  "유제품",
  "곡류",
];

type SortKey = "인기순" | "가나다순";
const SORTS: SortKey[] = ["인기순", "가나다순"];

type Ingredient = {
  slug: string;
  name: string;
  emoji: string;
  rating: number;
  category: Category;
  inSeason: boolean;
};

const SEASONAL: Array<Ingredient & { season: string }> = [
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

const INGREDIENTS: Ingredient[] = [
  { slug: "watermelon", name: "수박", emoji: "🍉", rating: 4.7, category: "과일", inSeason: true },
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

/* ── 별점 ──────────────────────────────────────────────── */
function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground">
      <span className="text-jg-star">★</span>
      {value.toFixed(1)}
    </span>
  );
}

export default function SearchPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("전체");
  const [sort, setSort] = useState<SortKey>("인기순");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    let items = INGREDIENTS.filter((i) => category === "전체" || i.category === category);
    if (query.trim()) items = items.filter((i) => i.name.includes(query.trim()));
    const sorted = [...items];
    if (sort === "인기순") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "가나다순") sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    else sorted.sort((a, b) => Number(b.inSeason) - Number(a.inSeason) || b.rating - a.rating);
    return sorted;
  }, [category, sort, query]);

  // 공통 layout(src/app/layout.tsx)이 Header·TabBar·main 셸을 제공한다.
  // 여기선 셸 안 콘텐츠만 렌더한다(자체 min-h-screen·main 중복 금지).
  return (
    // 전체 컨테이너
    <div className="flex flex-col gap-4">
      {/* 검색바 */}
      <div>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-muted">
          <Search size={20} strokeWidth={1.8} className="text-jg-ink-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="재료 이름으로 검색해보세요"
            className="w-full bg-transparent text-sm outline-none placeholder:text-jg-ink-mute text-foreground "
            type="search"
            aria-label="재료 검색"
          />
        </div>
      </div>

      {/* 카테고리 필터칩 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* 지금 제철 재료 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">지금 제철 재료</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {SEASONAL.map((item) => (
            <Link
              key={item.slug}
              href={`/ingredients/${item.slug}`}
              className="flex w-31 shrink-0 flex-col gap-1 rounded-lg p-3 bg-card border border-border shadow-xs shadow-gray-100"
            >
              <div className="grid h-23 place-items-center rounded-sm text-4xl bg-muted">
                {item.emoji}
              </div>
              <span className="text-sm font-semibold">{item.name}</span>
              <span className="w-fit items-center py-0.5 text-xs font-semibold text-jg-buy flex gap-1">
                <span className="bg-jg-buy-bg rounded-full px-2 py-0.5">제철</span>
                <span>{item.season}</span>
              </span>
              <span>
                <Rating value={item.rating} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        {/* 정렬 탭 */}
        <div className="flex items-center justify-between border-b border-b-border">
          <div className="flex gap-5">
            {SORTS.map((option) => {
              const active = option === sort;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSort(option)}
                  className={`relative pb-2 text-[15px] transition-colors ${active ? "text-foreground text-semibold" : "text-jg-ink-mute text-medium"}`}
                >
                  {option}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 재료 그리드 */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-5 pt-5">
          {list.map((item) => (
            <Link
              key={item.slug}
              href={`/ingredients/${item.slug}`}
              className="flex flex-col items-center text-center overflow-hidden border rounded-sm bg-card"
            >
              <div className="grid aspect-square w-full place-items-center text-3xl">
                {item.emoji}
              </div>
              <div className="flex flex-col items-center bg-background w-full p-2">
                <span className="text-sm font-semibold">{item.name}</span>
                <span>
                  <Rating value={item.rating} />
                </span>
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <p className="col-span-4 py-10 text-center text-sm text-jg-ink-mute">
              조건에 맞는 재료가 없어요.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
