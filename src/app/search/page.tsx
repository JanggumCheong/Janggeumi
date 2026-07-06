"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, MessageCircle, Search } from "lucide-react";

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

type SortKey = "인기순" | "가나다순" | "제철순";
const SORTS: SortKey[] = ["인기순", "가나다순", "제철순"];

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
    season: "6~8월",
  },
  {
    slug: "corn",
    name: "옥수수",
    emoji: "🌽",
    rating: 4.6,
    category: "곡류",
    inSeason: true,
    season: "6~9월",
  },
  {
    slug: "peach",
    name: "복숭아",
    emoji: "🍑",
    rating: 4.5,
    category: "과일",
    inSeason: true,
    season: "6~8월",
  },
  {
    slug: "cucumber",
    name: "오이",
    emoji: "🥒",
    rating: 4.4,
    category: "채소",
    inSeason: true,
    season: "4~9월",
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
    <span
      className="inline-flex items-center gap-0.5 text-[12px] font-semibold"
      style={{ color: "var(--muted-foreground)" }}
    >
      <span style={{ color: "var(--jg-star)" }}>★</span>
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
    <div className="flex flex-col">
      {/* 검색바 */}
          <div className="pb-1 pt-1">
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-3"
              style={{ background: "var(--muted)" }}
            >
              <Search size={20} strokeWidth={1.8} style={{ color: "var(--jg-ink-mute)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="재료 이름으로 검색해보세요"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-[color:var(--ph)]"
                style={{ color: "var(--foreground)", ["--ph" as string]: "var(--jg-ink-mute)" }}
                type="search"
                aria-label="재료 검색"
              />
            </div>
          </div>

          {/* 카테고리 필터칩 */}
          <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className="shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors"
                  style={{
                    background: active ? "var(--primary)" : "var(--secondary)",
                    color: active ? "var(--primary-foreground)" : "var(--primary)",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* 지금 제철 재료 */}
          <section className="pt-2">
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-[17px] font-bold">지금 제철 재료</h2>
              <button
                type="button"
                className="flex items-center gap-0.5 text-[13px] font-semibold"
                style={{ color: "var(--jg-ink-mute)" }}
              >
                더보기 <ChevronRight size={14} strokeWidth={1.8} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SEASONAL.map((item) => (
                <Link
                  key={item.slug}
                  href={`/ingredients/${item.slug}`}
                  className="flex w-[124px] shrink-0 flex-col rounded-2xl p-3"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 10px rgba(31,29,24,.05)",
                  }}
                >
                  <div
                    className="mb-2 grid h-[92px] place-items-center rounded-xl text-4xl"
                    style={{ background: "var(--muted)" }}
                  >
                    {item.emoji}
                  </div>
                  <span className="text-[15px] font-bold">{item.name}</span>
                  <span
                    className="mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: "var(--jg-buy-bg)", color: "var(--jg-buy)" }}
                  >
                    제철 {item.season}
                  </span>
                  <span className="mt-1.5">
                    <Rating value={item.rating} />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* 정렬 탭 */}
          <div
            className="mt-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex gap-5">
              {SORTS.map((s) => {
                const active = s === sort;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSort(s)}
                    className="relative pb-2 text-[15px] transition-colors"
                    style={{
                      color: active ? "var(--foreground)" : "var(--jg-ink-mute)",
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {s}
                    {active && (
                      <span
                        className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <button type="button" aria-label="의견" className="pb-2">
              <MessageCircle size={18} strokeWidth={1.8} style={{ color: "var(--jg-ink-mute)" }} />
            </button>
          </div>

          {/* 재료 그리드 */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-5 pt-5">
            {list.map((item) => (
              <Link
                key={item.slug}
                href={`/ingredients/${item.slug}`}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="grid aspect-square w-full place-items-center rounded-full text-3xl"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  {item.emoji}
                </div>
                <span className="mt-2 text-[13px] font-bold">{item.name}</span>
                <span className="mt-0.5">
                  <Rating value={item.rating} />
                </span>
              </Link>
            ))}
            {list.length === 0 && (
              <p
                className="col-span-4 py-10 text-center text-[14px]"
                style={{ color: "var(--jg-ink-mute)" }}
              >
                조건에 맞는 재료가 없어요.
              </p>
            )}
          </div>
    </div>
  );
}
