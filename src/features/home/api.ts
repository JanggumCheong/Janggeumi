import { apiUrl } from "@/lib/api";

export type HomeTrendingIngredient = {
  slug: string;
  name: string;
  emoji: string;
  imageSrc?: string;
};

export type HomeRecommendedBanner = {
  id: string;
  slug: string;
  name: string;
  catchphrase: {
    highlight: string;
    title: string;
  };
  highlightColor: string;
  titleColor: string;
  imageSrc: string;
  isSeason: boolean;
  detailHref: string;
};

export type HomeRecentViewedIngredient = HomeTrendingIngredient & {
  viewedAt: string;
};

export type HomeData = {
  recommendedBanners: HomeRecommendedBanner[];
  trendingIngredients: HomeTrendingIngredient[];
  recentViews: HomeRecentViewedIngredient[];
};

type ApiHomeIngredient = {
  id?: string;
  name?: string;
  emoji?: string;
  image_url?: string;
  catchphrase?: {
    highlight?: string;
    title?: string;
  };
  is_season?: boolean;
  rank?: number;
};

type ApiHomeResponse = {
  today_recommended_ingredients?: ApiHomeIngredient[];
  weekly_trending_ingredients?: ApiHomeIngredient[];
  recent_views?: ApiHomeIngredient[];
};

const DEFAULT_BANNER_COLORS = {
  highlightColor: "#2F7D4F",
  titleColor: "#E94F64",
};

const INGREDIENT_BANNER_COLORS: Record<string, typeof DEFAULT_BANNER_COLORS> = {
  ing_watermelon: {
    highlightColor: "#2F7D4F",
    titleColor: "#E94F64",
  },
  ing_peach: {
    highlightColor: "#C86445",
    titleColor: "#F28C6B",
  },
  ing_plum: {
    highlightColor: "#6A3E7C",
    titleColor: "#B73F63",
  },
  ing_banana: {
    highlightColor: "#B88A1C",
    titleColor: "#FFD54A",
  },
  ing_mango: {
    highlightColor: "#4E8C42",
    titleColor: "#F4A321",
  },
};

function slugFromId(id: string | undefined): string {
  return (id ?? "").replace(/^ing_/, "").replace(/_/g, "-");
}

function normalizeImageSrc(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;

  const withoutPublicPrefix = imageUrl.replace(/^public\//, "");
  return withoutPublicPrefix.startsWith("/") ? withoutPublicPrefix : `/${withoutPublicPrefix}`;
}

function adaptRecommendedBanner(item: ApiHomeIngredient): HomeRecommendedBanner | undefined {
  const slug = slugFromId(item.id);
  const imageSrc = normalizeImageSrc(item.image_url);

  if (!slug || !item.name || !imageSrc) return undefined;

  const colors = item.id
    ? (INGREDIENT_BANNER_COLORS[item.id] ?? DEFAULT_BANNER_COLORS)
    : DEFAULT_BANNER_COLORS;

  return {
    id: item.id ?? `ing_${slug}`,
    slug,
    name: item.name,
    catchphrase: {
      highlight: item.catchphrase?.highlight ?? item.name,
      title: item.catchphrase?.title ?? item.name,
    },
    ...colors,
    imageSrc,
    isSeason: item.is_season ?? false,
    detailHref: `/ingredients/${slug}`,
  };
}

function adaptTrendingIngredient(item: ApiHomeIngredient): HomeTrendingIngredient | undefined {
  const slug = slugFromId(item.id);

  if (!slug || !item.name) return undefined;

  return {
    slug,
    name: item.name,
    emoji: item.emoji ?? "🍽️",
    imageSrc: normalizeImageSrc(item.image_url),
  };
}

function adaptRecentView(
  item: ApiHomeIngredient,
  index: number,
): HomeRecentViewedIngredient | undefined {
  const ingredient = adaptTrendingIngredient(item);

  if (!ingredient) return undefined;

  return {
    ...ingredient,
    viewedAt: item.id ?? String(index),
  };
}

export async function fetchHomeData(): Promise<HomeData> {
  const response = await fetch(apiUrl("/v1/home"), { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch home data: ${response.status}`);
  }

  const data = (await response.json()) as ApiHomeResponse;

  return {
    recommendedBanners: (data.today_recommended_ingredients ?? [])
      .map(adaptRecommendedBanner)
      .filter((item): item is HomeRecommendedBanner => Boolean(item)),
    trendingIngredients: (data.weekly_trending_ingredients ?? [])
      .map(adaptTrendingIngredient)
      .filter((item): item is HomeTrendingIngredient => Boolean(item)),
    recentViews: (data.recent_views ?? [])
      .map(adaptRecentView)
      .filter((item): item is HomeRecentViewedIngredient => Boolean(item)),
  };
}
