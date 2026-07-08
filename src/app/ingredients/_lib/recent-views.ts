export type RecentViewedIngredient = {
  slug: string;
  name: string;
  emoji: string;
  imageSrc?: string;
  viewedAt: string;
};

export const RECENT_VIEWS_STORAGE_KEY = "janggeumi:recentViewedIngredients";
export const RECENT_VIEWS_UPDATED_EVENT = "janggeumi:recentViewedIngredientsUpdated";
export const RECENT_VIEWS_LIMIT = 5;

const INGREDIENT_IMAGE_SRC: Record<string, string> = {
  apple: "/images/ingredients/apple.webp",
  avocado: "/images/ingredients/avocado.webp",
  peach: "/images/ingredients/peach.webp",
  "shine-muscat": "/images/ingredients/shine-muscat.webp",
  strawberry: "/images/ingredients/strawberry.webp",
  watermelon: "/images/ingredients/watermelon.webp",
};

function isRecentViewedIngredient(value: unknown): value is RecentViewedIngredient {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<RecentViewedIngredient>;
  return (
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.emoji === "string" &&
    typeof item.viewedAt === "string"
  );
}

export function getIngredientImageSrc(slug: string): string | undefined {
  return INGREDIENT_IMAGE_SRC[slug];
}

export function readRecentViewedIngredients(): RecentViewedIngredient[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(RECENT_VIEWS_STORAGE_KEY);
    if (!rawValue) return [];

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter(isRecentViewedIngredient).slice(-RECENT_VIEWS_LIMIT);
  } catch {
    return [];
  }
}

export function addRecentViewedIngredient(
  ingredient: Pick<RecentViewedIngredient, "slug" | "name" | "emoji">,
): RecentViewedIngredient[] {
  if (typeof window === "undefined") return [];

  const nextItem: RecentViewedIngredient = {
    ...ingredient,
    imageSrc: getIngredientImageSrc(ingredient.slug),
    viewedAt: new Date().toISOString(),
  };
  const previousItems = readRecentViewedIngredients().filter(
    (item) => item.slug !== ingredient.slug,
  );
  const nextItems = [...previousItems, nextItem].slice(-RECENT_VIEWS_LIMIT);

  window.localStorage.setItem(RECENT_VIEWS_STORAGE_KEY, JSON.stringify(nextItems));
  window.dispatchEvent(new Event(RECENT_VIEWS_UPDATED_EVENT));

  return nextItems;
}
