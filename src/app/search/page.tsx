"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/* ── 장금이 디자인 토큰 (design-system.md) — globals 미적용 상태라 직접 사용 ── */
const C = {
  primary: "#5C6E3D",
  primarySoft: "#EEF1E6",
  bg: "#FBFBFA",
  surface: "#FFFFFF",
  sunken: "#F4F4F2",
  ink: "#1F1D18",
  inkSub: "#6B675E",
  inkMute: "#9B978C",
  line: "#E7E4DC",
  buy: "#1F804D",
  buyBg: "#E9F6EE",
  star: "#F0A93B",
} as const;

const FONT =
  '-apple-system, "Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", sans-serif';

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
  { slug: "watermelon", name: "수박", emoji: "🍉", rating: 4.7, category: "과일", inSeason: true, season: "6~8월" },
  { slug: "corn", name: "옥수수", emoji: "🌽", rating: 4.6, category: "곡류", inSeason: true, season: "6~9월" },
  { slug: "peach", name: "복숭아", emoji: "🍑", rating: 4.5, category: "과일", inSeason: true, season: "6~8월" },
  { slug: "cucumber", name: "오이", emoji: "🥒", rating: 4.4, category: "채소", inSeason: true, season: "4~9월" },
];

const INGREDIENTS: Ingredient[] = [
  { slug: "watermelon", name: "수박", emoji: "🍉", rating: 4.7, category: "과일", inSeason: true },
  { slug: "onion", name: "양파", emoji: "🧅", rating: 4.6, category: "채소", inSeason: false },
  { slug: "potato", name: "감자", emoji: "🥔", rating: 4.5, category: "채소", inSeason: false },
  { slug: "green-onion", name: "대파", emoji: "🌿", rating: 4.6, category: "채소", inSeason: false },
  { slug: "tomato", name: "토마토", emoji: "🍅", rating: 4.7, category: "채소", inSeason: true },
  { slug: "zucchini", name: "애호박", emoji: "🥒", rating: 4.5, category: "채소", inSeason: true },
  { slug: "eggplant", name: "가지", emoji: "🍆", rating: 4.6, category: "채소", inSeason: true },
  { slug: "cabbage", name: "양배추", emoji: "🥬", rating: 4.5, category: "채소", inSeason: false },
  { slug: "tofu", name: "두부", emoji: "🧈", rating: 4.5, category: "유제품", inSeason: false },
  { slug: "chicken", name: "닭고기", emoji: "🍗", rating: 4.6, category: "육류", inSeason: false },
  { slug: "squid", name: "오징어", emoji: "🦑", rating: 4.5, category: "수산", inSeason: false },
  { slug: "egg", name: "계란", emoji: "🥚", rating: 4.6, category: "유제품", inSeason: false },
];

/* ── 아이콘 (인라인 SVG) ─────────────────────────────────── */
function Icon({ path, size = 22, stroke = C.ink, fill = "none" }: { path: string; size?: number; stroke?: string; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}
const P = {
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z",
  user: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  leaf: "M11 20A7 7 0 0 1 4 13c0-6 8-9 16-10 0 8-3 16-9 17Z M4 21c1-4 4-7 8-9",
  heart: "M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21Z",
  chevron: "m9 6 6 6-6 6",
};

/* ── 별점 ──────────────────────────────────────────────── */
function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold" style={{ color: C.inkSub }}>
      <span style={{ color: C.star }}>★</span>
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

  return (
    <div className="flex min-h-screen justify-center" style={{ background: "#EDEDEA", fontFamily: FONT }}>
      {/* 모바일 앱 화면 */}
      <div className="relative flex w-full max-w-[420px] flex-col" style={{ background: C.bg, color: C.ink }}>
        {/* ── 상단 앱바 ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 pb-3 pt-4" style={{ background: C.bg }}>
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight">검색</h1>
            {/* <p className="mt-0.5 text-[13px] font-medium" style={{ color: C.inkMute }}>
              모든 식재료를 한눈에
            </p> */}
          </div>
          {/* <div className="flex items-center gap-1">
            <button className="grid h-10 w-10 place-items-center rounded-full" aria-label="알림" type="button">
              <Icon path={P.chat} stroke={C.inkSub} />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-full" aria-label="마이페이지" type="button">
              <Icon path={P.user} stroke={C.inkSub} />
            </button>
          </div> */}
        </header>

        {/* ── 스크롤 콘텐츠 ── */}
        <main className="flex-1 overflow-y-auto pb-28">
          {/* 검색바 */}
          <div className="px-5 pb-1 pt-1">
            <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: C.sunken }}>
              <Icon path={P.search} size={20} stroke={C.inkMute} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="재료 이름으로 검색해보세요"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-[color:var(--ph)]"
                style={{ color: C.ink, ["--ph" as string]: C.inkMute }}
                type="search"
                aria-label="재료 검색"
              />
            </div>
          </div>

          {/* 카테고리 필터칩 */}
          <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className="shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors"
                  style={{
                    background: active ? C.primary : C.primarySoft,
                    color: active ? "#FFFFFF" : C.primary,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* 지금 제철 재료 */}
          <section className="pt-2">
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-[17px] font-bold">지금 제철 재료</h2>
              <button type="button" className="flex items-center gap-0.5 text-[13px] font-semibold" style={{ color: C.inkMute }}>
                더보기 <Icon path={P.chevron} size={14} stroke={C.inkMute} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SEASONAL.map((item) => (
                <Link
                  key={item.slug}
                  href={`/ingredients/${item.slug}`}
                  className="flex w-[124px] shrink-0 flex-col rounded-2xl p-3"
                  style={{ background: C.surface, border: `1px solid ${C.line}`, boxShadow: "0 2px 10px rgba(31,29,24,.05)" }}
                >
                  <div className="mb-2 grid h-[92px] place-items-center rounded-xl text-4xl" style={{ background: C.sunken }}>
                    {item.emoji}
                  </div>
                  <span className="text-[15px] font-bold">{item.name}</span>
                  <span className="mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: C.buyBg, color: C.buy }}>
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
          <div className="mt-4 flex items-center justify-between px-5" style={{ borderBottom: `1px solid ${C.line}` }}>
            <div className="flex gap-5">
              {SORTS.map((s) => {
                const active = s === sort;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSort(s)}
                    className="relative pb-2 text-[15px] transition-colors"
                    style={{ color: active ? C.ink : C.inkMute, fontWeight: active ? 700 : 500 }}
                  >
                    {s}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full" style={{ background: C.primary }} />
                    )}
                  </button>
                );
              })}
            </div>
            <button type="button" aria-label="의견" className="pb-2">
              <Icon path={P.chat} size={18} stroke={C.inkMute} />
            </button>
          </div>

          {/* 재료 그리드 */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-5 px-5 pt-5">
            {list.map((item) => (
              <Link key={item.slug} href={`/ingredients/${item.slug}`} className="flex flex-col items-center text-center">
                <div className="grid aspect-square w-full place-items-center rounded-full text-3xl" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                  {item.emoji}
                </div>
                <span className="mt-2 text-[13px] font-bold">{item.name}</span>
                <span className="mt-0.5">
                  <Rating value={item.rating} />
                </span>
              </Link>
            ))}
            {list.length === 0 && (
              <p className="col-span-4 py-10 text-center text-[14px]" style={{ color: C.inkMute }}>
                조건에 맞는 재료가 없어요.
              </p>
            )}
          </div>
        </main>

        {/* ── 하단 탭바 ── */}
        {/* <nav className="absolute inset-x-0 bottom-0 flex items-end justify-around px-2 pb-2 pt-2" style={{ background: C.surface, borderTop: `1px solid ${C.line}` }}>
          <TabItem label="홈" path={P.home} href="/" />
          <TabItem label="재료" path={P.leaf} href="/search" active />
          <div className="relative -mt-6 flex flex-col items-center">
            <button type="button" aria-label="장금이" className="grid h-14 w-14 place-items-center rounded-full text-2xl shadow-lg" style={{ background: C.primary, boxShadow: "0 6px 20px rgba(31,29,24,.18)" }}>
              🧑‍🍳
            </button>
          </div>
          <TabItem label="커뮤니티" path={P.heart} href="#" />
          <TabItem label="마이페이지" path={P.user} href="#" />
        </nav> */}
      </div>
    </div>
  );
}

// function TabItem({ label, path, href, active = false }: { label: string; path: string; href: string; active?: boolean }) {
//   const color = active ? C.primary : C.inkMute;
//   return (
//     <Link href={href} className="flex flex-1 flex-col items-center gap-1 py-1">
//       <Icon path={path} size={22} stroke={color} />
//       <span className="text-[11px] font-semibold" style={{ color }}>
//         {label}
//       </span>
//     </Link>
//   );
// }
