"use client";

import { type FormEvent, useEffect, useState } from "react";
import localFont from "next/font/local";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ChevronRight, Clock3, Leaf, Search, X } from "lucide-react";
import { fetchHomeData, type HomeRecommendedBanner } from "@/features/home/api";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import {
  RECENT_VIEWS_UPDATED_EVENT,
  type RecentViewedIngredient,
  readRecentViewedIngredients,
} from "./ingredients/_lib/recent-views";

const roundedMisoBold = localFont({
  src: "./fonts/HakgyoansimDunggeunmisoTTF-B.woff2",
  display: "swap",
});

const roundedMisoRegular = localFont({
  src: "./fonts/HakgyoansimDunggeunmisoTTF-R.woff2",
  display: "swap",
});

const TRENDING_PAGE_SIZE = 4;

function getSearchTarget(query: string) {
  const keyword = query.trim();

  if (!keyword) {
    return "/search";
  }

  return `/search?q=${encodeURIComponent(keyword)}`;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-[#e9eadf] ${className}`} />;
}

function TrendingIngredientsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2" aria-hidden="true">
      {Array.from({ length: TRENDING_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="grid gap-1.5 rounded-lg border border-border p-1.5 shadow-[0_3px_10px_rgba(31,29,24,0.04)]"
        >
          <SkeletonBlock className="aspect-square rounded-[7px]" />
          <SkeletonBlock className="mx-auto h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

function RecommendedBannerSkeleton() {
  return (
    <div className="relative size-full overflow-hidden bg-[#f6f5ef]" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-r from-[#fbfbfa] via-[#fbfbfa]/80 to-transparent" />
      <div className="absolute top-5 left-0 flex w-[58%] flex-col px-5">
        <SkeletonBlock className="mb-3 h-5 w-16 rounded-full" />
        <SkeletonBlock className="mb-2 h-6 w-32" />
        <SkeletonBlock className="h-9 w-24" />
      </div>
      <SkeletonBlock className="absolute right-4 bottom-4 size-9 rounded-full bg-[#dedfcf]" />
      <div className="absolute bottom-4 left-5 flex items-center gap-1.5">
        <SkeletonBlock className="h-1.5 w-4 rounded-full bg-[#cdd5c1]" />
        <SkeletonBlock className="size-1.5 rounded-full bg-[#cdd5c1]" />
      </div>
    </div>
  );
}

function HomeDataEmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-24 place-items-center rounded-lg border border-dashed border-[#cfd6c4] bg-card/65 px-4 text-center">
      <p className="text-[12px] font-bold text-[#aaa69d]">{message}</p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recommendedBannerIndex, setRecommendedBannerIndex] = useState(0);
  const [trendingPage, setTrendingPage] = useState(0);
  const [recentViewedIngredients, setRecentViewedIngredients] = useState<RecentViewedIngredient[]>(
    [],
  );
  const [isRecommendedBannerPaused, setIsRecommendedBannerPaused] = useState(false);
  const {
    data: homeData,
    isError: isHomeDataError,
    isLoading: isHomeDataLoading,
  } = useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeData,
  });

  const recommendedBanners = homeData?.recommendedBanners ?? [];
  const trendingIngredients = homeData?.trendingIngredients ?? [];
  const hasRecommendedBanners = recommendedBanners.length > 0;
  const hasTrendingIngredients = trendingIngredients.length > 0;
  const homeRecentViewedIngredients = homeData?.recentViews.length
    ? homeData.recentViews
    : recentViewedIngredients;
  const trendingTotalPages = Math.max(
    1,
    Math.ceil(trendingIngredients.length / TRENDING_PAGE_SIZE),
  );
  const safeRecommendedBannerIndex = hasRecommendedBanners
    ? recommendedBannerIndex % recommendedBanners.length
    : 0;
  const safeTrendingPage = trendingPage % trendingTotalPages;

  const activeRecommendedBanner: HomeRecommendedBanner | undefined = hasRecommendedBanners
    ? recommendedBanners[safeRecommendedBannerIndex]
    : undefined;

  const visibleTrendingIngredients = trendingIngredients.slice(
    safeTrendingPage * TRENDING_PAGE_SIZE,
    safeTrendingPage * TRENDING_PAGE_SIZE + TRENDING_PAGE_SIZE,
  );

  useEffect(() => {
    function syncRecentViewedIngredients() {
      setRecentViewedIngredients(readRecentViewedIngredients());
    }

    syncRecentViewedIngredients();
    window.addEventListener("storage", syncRecentViewedIngredients);
    window.addEventListener(RECENT_VIEWS_UPDATED_EVENT, syncRecentViewedIngredients);

    return () => {
      window.removeEventListener("storage", syncRecentViewedIngredients);
      window.removeEventListener(RECENT_VIEWS_UPDATED_EVENT, syncRecentViewedIngredients);
    };
  }, []);

  useEffect(() => {
    if (isRecommendedBannerPaused || recommendedBanners.length < 2) return;

    const timerId = window.setInterval(() => {
      setRecommendedBannerIndex((currentIndex) => {
        return (currentIndex + 1) % recommendedBanners.length;
      });
    }, 4500);

    return () => window.clearInterval(timerId);
  }, [isRecommendedBannerPaused, recommendedBanners.length]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(getSearchTarget(query));
  }

  function moveTrendingPage(direction: -1 | 1) {
    setTrendingPage((currentPage) => {
      return (currentPage + direction + trendingTotalPages) % trendingTotalPages;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex min-h-12 items-center gap-3 rounded-[17px] border-2 border-primary bg-card px-4"
        role="search"
        onSubmit={handleSearchSubmit}
      >
        <button
          type="submit"
          className="grid size-5 flex-none cursor-pointer place-items-center text-primary"
          aria-label="재료 검색"
        >
          <Search className="size-5" strokeWidth={2.4} />
        </button>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-extrabold text-foreground outline-none placeholder:text-[#b8b4aa]"
          type="text"
          aria-label="재료 검색"
          placeholder={isSearchFocused ? "" : "재료를 검색해보세요 (예: 수박, 양파)"}
        />
        {query && (
          <button
            type="button"
            className="grid size-5 flex-none cursor-pointer place-items-center text-[#b8b4aa]"
            aria-label="검색어 지우기"
            onClick={() => setQuery("")}
          >
            <X className="size-4" strokeWidth={2.4} />
          </button>
        )}
      </form>

      <section
        className="relative aspect-[1029/582] overflow-hidden rounded-lg"
        aria-label="장금이 앱 소개"
      >
        <ImageWithFallback
          src="/images/main/janggeumi-main-banner.png"
          alt="똑똑한 식재료 관리, 장금이와 함께해요"
          fill
          priority
          className="object-cover"
          sizes="420px"
          fallbackClassName="text-primary"
        />
        <Link
          href="/search"
          className={`${roundedMisoRegular.className} group absolute bottom-8 left-5 flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 leading-none text-primary-foreground shadow-[0_3px_10px_rgba(92,110,61,0.16)] transition-colors duration-200 hover:bg-[#47562f]`}
        >
          <span className="flex items-center justify-center text-sm">재료 검색</span>
          <ArrowRight
            className="flex size-3.5 items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.4}
          />
        </Link>
      </section>

      <section className="flex flex-col gap-2" aria-label="인기 상승 재료">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[19px] text-[#344127]">인기 상승 재료🔥</h2>
          <Link
            href="/search"
            className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#9b978c] transition-colors hover:text-[#343A40]"
          >
            전체보기
            <ChevronRight className="size-3.5" strokeWidth={2.4} />
          </Link>
        </div>

        {isHomeDataLoading ? (
          <TrendingIngredientsSkeleton />
        ) : hasTrendingIngredients ? (
          <>
            <div className="grid grid-cols-4 gap-2">
              {visibleTrendingIngredients.map((ingredient) => (
                <Link
                  key={ingredient.slug}
                  href={`/ingredients/${ingredient.slug}`}
                  className="grid gap-1.5 rounded-lg border border-border p-1.5 shadow-[0_3px_10px_rgba(31,29,24,0.04)] transition-colors hover:border-primary/35"
                >
                  <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[7px]">
                    {ingredient.imageSrc ? (
                      <ImageWithFallback
                        src={ingredient.imageSrc}
                        alt={`${ingredient.name} 이미지`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <span className="text-[28px]" aria-hidden="true">
                        {ingredient.emoji}
                      </span>
                    )}
                  </div>
                  <strong className="truncate text-center text-[11px] leading-tight font-black text-foreground">
                    {ingredient.name}
                  </strong>
                </Link>
              ))}
            </div>

            {trendingTotalPages > 1 && (
              <div
                className="flex items-center justify-center gap-3"
                aria-label="인기 상승 재료 페이지"
              >
                <button
                  type="button"
                  className="grid size-8 cursor-pointer place-items-center rounded-full border border-border bg-card text-primary"
                  aria-label="이전 인기 상승 재료"
                  onClick={() => moveTrendingPage(-1)}
                >
                  <ArrowLeft className="size-4" strokeWidth={2.4} />
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: trendingTotalPages }).map((_, pageIndex) => (
                    <button
                      key={pageIndex}
                      type="button"
                      className={`h-1.5 cursor-pointer rounded-full transition-all ${
                        pageIndex === safeTrendingPage ? "w-4 bg-primary" : "w-1.5 bg-[#d4d8ca]"
                      }`}
                      aria-label={`${pageIndex + 1}번째 인기 상승 재료 페이지`}
                      aria-current={pageIndex === safeTrendingPage ? "page" : undefined}
                      onClick={() => setTrendingPage(pageIndex)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="grid size-8 cursor-pointer place-items-center rounded-full border border-border bg-card text-primary"
                  aria-label="다음 인기 상승 재료"
                  onClick={() => moveTrendingPage(1)}
                >
                  <ArrowRight className="size-4" strokeWidth={2.4} />
                </button>
              </div>
            )}
          </>
        ) : (
          <HomeDataEmptyState
            message={
              isHomeDataError
                ? "인기 상승 재료를 불러오지 못했어요"
                : "인기 상승 재료가 아직 없어요"
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-2" aria-label="최근 본 재료">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[19px] text-[#344127]">최근 본 재료</h2>
        </div>

        <div className="rounded-[14px] border border-dashed border-[#cfd6c4] bg-card/65 px-3 py-3">
          {homeRecentViewedIngredients.length > 0 ? (
            <div className="grid grid-cols-5 gap-1.5">
              {homeRecentViewedIngredients.map((ingredient) => (
                <Link
                  key={`${ingredient.slug}-${ingredient.viewedAt}`}
                  href={`/ingredients/${ingredient.slug}`}
                  className="grid min-w-0 justify-items-center gap-1"
                  aria-label={`${ingredient.name} 상세 보기`}
                >
                  <span className="relative grid size-12 place-items-center overflow-hidden rounded-full border border-border bg-[#f8f5ec] shadow-[0_3px_10px_rgba(31,29,24,0.04)]">
                    {ingredient.imageSrc ? (
                      <ImageWithFallback
                        src={ingredient.imageSrc}
                        alt={`${ingredient.name} 이미지`}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <span className="text-[22px]" aria-hidden="true">
                        {ingredient.emoji}
                      </span>
                    )}
                  </span>
                  <strong className="max-w-full truncate text-center text-[10px] leading-tight font-black text-foreground">
                    {ingredient.name}
                  </strong>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid min-h-16 place-items-center gap-1 text-center text-muted-foreground">
              <Clock3 className="size-6 text-[#beb9b0]" strokeWidth={1.7} />
              <p className="text-[12px] font-bold text-[#aaa69d]">아직 본 재료가 없어요</p>
            </div>
          )}
        </div>
      </section>

      <section
        className="relative aspect-video overflow-hidden rounded-lg border border-[#e5e8dc]"
        aria-label="오늘 추천 식자재"
        onMouseEnter={() => setIsRecommendedBannerPaused(true)}
        onMouseLeave={() => setIsRecommendedBannerPaused(false)}
      >
        {isHomeDataLoading ? (
          <RecommendedBannerSkeleton />
        ) : activeRecommendedBanner ? (
          <>
            <Link
              href={activeRecommendedBanner.detailHref}
              className="group block size-full"
              aria-label={`${activeRecommendedBanner.name} 상세 보기`}
            >
              <ImageWithFallback
                src={activeRecommendedBanner.imageSrc}
                alt={`${activeRecommendedBanner.name} 추천 배너`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                sizes="420px"
                fallbackClassName="text-primary"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#fbfbfa]/95 via-[#fbfbfa]/72 to-transparent" />

              <div className="absolute top-5 left-0 flex w-[58%] flex-col px-5">
                {activeRecommendedBanner.isSeason && (
                  <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full border border-[#bfd3a4] bg-[#f2f7e9] px-2.5 py-1 text-[11px] leading-none font-black text-[#6f8d45]">
                    <Leaf className="size-3 fill-current opacity-45" strokeWidth={1.8} />
                    제철
                  </span>
                )}
                <p className={`${roundedMisoBold.className} flex flex-col text-2xl leading-tight`}>
                  <span
                    className="whitespace-nowrap"
                    style={{ color: activeRecommendedBanner.highlightColor }}
                  >
                    {activeRecommendedBanner.catchphrase.highlight}
                  </span>
                  <span className="text-4xl" style={{ color: activeRecommendedBanner.titleColor }}>
                    {activeRecommendedBanner.catchphrase.title}
                  </span>
                </p>
              </div>

              <span className="absolute right-4 bottom-4 grid size-9 place-items-center rounded-full bg-white/88 text-primary shadow-[0_4px_14px_rgba(31,29,24,0.12)]">
                <ArrowRight className="size-4" strokeWidth={2.4} />
              </span>
            </Link>

            {recommendedBanners.length > 1 && (
              <div
                className="absolute bottom-4 left-5 flex items-center gap-1.5"
                aria-label="추천 식자재 배너 페이지"
              >
                {recommendedBanners.map((banner, index) => (
                  <button
                    key={banner.id}
                    type="button"
                    className={`h-1.5 cursor-pointer rounded-full transition-all ${
                      index === safeRecommendedBannerIndex ? "w-4 bg-primary" : "w-1.5 bg-[#cdd5c1]"
                    }`}
                    aria-label={`${banner.name} 추천 배너 보기`}
                    aria-current={index === safeRecommendedBannerIndex ? "page" : undefined}
                    onClick={() => setRecommendedBannerIndex(index)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="grid size-full place-items-center bg-card/65 px-4 text-center">
            <p className="text-[12px] font-bold text-[#aaa69d]">
              {isHomeDataError
                ? "오늘 추천 식자재를 불러오지 못했어요"
                : "오늘 추천 식자재가 아직 없어요"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
