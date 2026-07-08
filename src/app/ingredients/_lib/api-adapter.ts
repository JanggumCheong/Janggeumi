import { z } from "zod";
import { apiUrl } from "@/lib/api";
import { IngredientSchema, type Ingredient, type StorageFilter } from "./types";

const ApiIngredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  catchphrase: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  good_case: z.string().nullable().optional(),
  bad_case: z.string().nullable().optional(),
});

const ApiPurchaseTipSchema = z.object({
  id: z.string().optional(),
  ingredient_id: z.string().optional(),
  filter_option_id: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  sort_order: z.number().optional(),
});

const ApiPurchaseResponseSchema = z.object({
  ingredient: ApiIngredientSchema.optional(),
  purchase_tips: z.array(ApiPurchaseTipSchema).optional(),
});

const ApiStorageFilterSchema = z.object({
  section_id: z.string().optional(),
  label: z.string(),
  options: z.array(
    z.object({
      option_id: z.string().optional(),
      option_name: z.string(),
    }),
  ),
});

const ApiStorageMethodSchema = z.object({
  id: z.string(),
  title: z.string(),
  is_recommended: z.boolean().optional(),
  recommended: z.boolean().optional(),
  tags: z.record(z.string(), z.string()).optional(),
  summary: z.string(),
  duration: z.string().optional(),
  durationDays: z.tuple([z.number(), z.number()]).optional(),
  rating: z
    .object({
      avg: z.number(),
      count: z.number(),
    })
    .optional(),
  janggeumiComment: z.string().optional(),
  comment: z
    .object({
      author: z
        .object({
          name: z.string(),
          type: z.enum(["ugc", "official", "curator"]),
        })
        .optional(),
      text: z.string().optional(),
    })
    .optional(),
});

const ApiStorageResponseSchema = z.object({
  storage_headline: z
    .object({
      title: z.string().optional(),
      headline: z.string().optional(),
      intro: z.string().optional(),
      janggeumi_tip: z.string().optional(),
    })
    .optional(),
  storage_filters: z.array(ApiStorageFilterSchema).optional(),
  storage_methods: z.array(ApiStorageMethodSchema).optional(),
});

const ApiAuthorSchema = z.object({
  name: z.string().optional(),
  type: z.enum(["ugc", "official", "curator"]).optional(),
  avatar_url: z.string().optional(),
});

const ApiRecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().optional(),
  desc: z.string().optional(),
  content: z.string().optional(),
  image: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  author: ApiAuthorSchema.optional(),
  reaction: z
    .object({
      likes: z.number().optional(),
      comments: z.number().optional(),
    })
    .optional(),
  source: z.unknown().nullable().optional(),
});

const ApiDisposeSchema = z.object({
  key: z.string().optional(),
  option_id: z.string().optional(),
  title: z.string(),
  way: z.string(),
  wasteType: z.enum(["food", "general", "recycle"]).optional(),
  waste_type: z.enum(["food", "general", "recycle"]).optional(),
  image: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

const ApiProcessingResponseSchema = z.object({
  handling_headline: z
    .object({
      headline: z.string().optional(),
      intro: z.string().optional(),
    })
    .optional(),
  recipes: z.array(ApiRecipeSchema).optional(),
  dispose: z.array(ApiDisposeSchema).optional(),
});

type ApiPurchaseResponse = z.infer<typeof ApiPurchaseResponseSchema>;
type ApiStorageResponse = z.infer<typeof ApiStorageResponseSchema>;
type ApiProcessingResponse = z.infer<typeof ApiProcessingResponseSchema>;

export async function getIngredientFromApi(slug: string, base: Ingredient): Promise<Ingredient> {
  const ingredientId = toApiIngredientId(slug);
  const [purchase, storage, processing] = await Promise.all([
    fetchApi(ApiPurchaseResponseSchema, `/v1/ingredients/${ingredientId}`),
    fetchApi(ApiStorageResponseSchema, `/v1/ingredients/${ingredientId}/storage`),
    fetchApi(ApiProcessingResponseSchema, `/v1/ingredients/${ingredientId}/processing`),
  ]);

  const next: Ingredient = {
    ...base,
    id: slug,
    name: purchase?.ingredient?.name ?? base.name,
    summary: purchase?.ingredient?.description ?? purchase?.ingredient?.catchphrase ?? base.summary,
    purchase: purchase ? adaptPurchase(purchase, base) : base.purchase,
    storage: storage ? adaptStorage(storage, base) : base.storage,
    handling: processing ? adaptHandling(processing, base) : base.handling,
  };

  return IngredientSchema.parse(next);
}

async function fetchApi<T extends z.ZodType>(schema: T, path: string): Promise<z.infer<T> | null> {
  try {
    const response = await fetch(apiUrl(path), { cache: "no-store" });
    if (!response.ok) return null;

    const json = await response.json();
    const parsed = schema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function adaptPurchase(api: ApiPurchaseResponse, base: Ingredient): Ingredient["purchase"] {
  const criteria = (api.purchase_tips ?? []).map((tip, index) => ({
    key: tip.id ?? tip.filter_option_id ?? `purchase-${index + 1}`,
    title:
      tip.title?.trim() ||
      extractTitle(tip.content) ||
      base.purchase.criteria[index]?.title ||
      "구매 기준",
    desc: tip.content?.trim() || tip.title?.trim() || base.purchase.criteria[index]?.desc || "",
    image: base.purchase.criteria[index]?.image ?? null,
    source: base.purchase.criteria[index]?.source,
  }));

  return {
    headline: base.purchase.headline,
    bestWorst: adaptBestWorst(api.ingredient, base),
    criteria: criteria.length > 0 ? criteria : base.purchase.criteria,
  };
}

/** 좋은/피할 예시 이미지 — API good_case/bad_case 로 대응(이미지만, 이모지 자리표시 없음). */
function adaptBestWorst(
  ingredient: ApiPurchaseResponse["ingredient"],
  base: Ingredient,
): Ingredient["purchase"]["bestWorst"] {
  if (!ingredient?.good_case && !ingredient?.bad_case) {
    return base.purchase.bestWorst;
  }
  return {
    good: { image: ingredient.good_case ?? null },
    bad: { image: ingredient.bad_case ?? null },
  };
}

function adaptStorage(api: ApiStorageResponse, base: Ingredient): Ingredient["storage"] {
  const filters = (api.storage_filters ?? []).map((filter) => ({
    key: normalizeFilterKey(filter.section_id ?? filter.label),
    label: filter.label,
    options: filter.options.map((option) => option.option_name),
  }));
  const optionNameById = createOptionLookup(api.storage_filters ?? []);

  const methods = (api.storage_methods ?? []).map((method, index) => ({
    id: method.id,
    title: method.title,
    recommended: method.is_recommended ?? method.recommended ?? false,
    tags: mapStorageTags(method.tags ?? {}, optionNameById, filters),
    summary: stripGuidePrefix(method.summary),
    durationDays: method.durationDays ?? parseDurationDays(method.duration),
    rating: method.rating,
    comment: adaptStorageComment(method),
    source: base.storage.methods[index]?.source,
  }));

  return {
    headline:
      api.storage_headline?.headline ?? api.storage_headline?.title ?? base.storage.headline,
    intro: api.storage_headline?.intro ?? base.storage.intro,
    filters: filters.length > 0 ? filters : base.storage.filters,
    methods: methods.length > 0 ? methods : base.storage.methods,
    tip: api.storage_headline?.janggeumi_tip ?? base.storage.tip,
  };
}

function adaptHandling(api: ApiProcessingResponse, base: Ingredient): Ingredient["handling"] {
  const recipes = (api.recipes ?? [])
    .filter(
      (recipe) => !isDisposeLike(`${recipe.category ?? ""} ${recipe.title} ${recipe.desc ?? ""}`),
    )
    .map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      category: recipe.category,
      desc: recipe.desc ?? recipe.content ?? "",
      image: recipe.image ?? recipe.image_url ?? null,
      author: {
        name: recipe.author?.name ?? "장금이",
        type: recipe.author?.type ?? "curator",
      },
      reaction: {
        likes: recipe.reaction?.likes ?? 0,
        comments: recipe.reaction?.comments ?? 0,
      },
      source: null,
    }));

  const dispose = (api.dispose ?? [])
    .filter((item) => !isRecipeLike(`${item.title} ${item.way}`))
    .map((item, index) => ({
      key: item.key ?? item.option_id ?? `dispose-${index + 1}`,
      title: item.title,
      way: item.way,
      wasteType: normalizeWasteType(item.wasteType ?? item.waste_type, item.way),
      image: item.image ?? item.image_url ?? null,
      source: base.handling.dispose?.[index]?.source,
    }));

  return {
    headline: api.handling_headline?.headline ?? base.handling.headline,
    intro: api.handling_headline?.intro ?? base.handling.intro,
    recipes: recipes.length > 0 ? recipes : base.handling.recipes,
    dispose: dispose.length > 0 ? dispose : base.handling.dispose,
  };
}

function toApiIngredientId(slug: string): string {
  return slug.startsWith("ing_") ? slug : `ing_${slug.replaceAll("-", "_")}`;
}

function extractTitle(content?: string): string | null {
  if (!content) return null;
  const [firstLine] = content.split("\n");
  return firstLine.length <= 24 ? firstLine.replace(/[:：]$/, "").trim() : null;
}

function normalizeFilterKey(input: string): string {
  if (input.includes("cut") || input.includes("form") || input.includes("자름")) return "form";
  if (input.includes("location") || input.includes("place") || input.includes("장소"))
    return "place";
  if (input.includes("period") || input.includes("duration") || input.includes("기간"))
    return "period";
  return input.replace(/^fs_/, "").replace(/_option_id$/, "");
}

function createOptionLookup(
  filters: z.infer<typeof ApiStorageFilterSchema>[],
): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const filter of filters) {
    for (const option of filter.options) {
      if (option.option_id) lookup.set(option.option_id, option.option_name);
    }
  }
  return lookup;
}

function mapStorageTags(
  tags: Record<string, string>,
  optionNameById: Map<string, string>,
  filters: StorageFilter[],
): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const [key, value] of Object.entries(tags)) {
    const normalizedKey = normalizeFilterKey(key);
    mapped[normalizedKey] = optionNameById.get(value) ?? value;
  }

  for (const filter of filters) {
    if (!mapped[filter.key] && filter.options.length === 1) {
      mapped[filter.key] = filter.options[0];
    }
  }

  return mapped;
}

function parseDurationDays(duration?: string): [number, number] | undefined {
  if (!duration) return undefined;
  const numbers = duration.match(/\d+/g)?.map(Number);
  if (!numbers?.length) return undefined;
  return numbers.length === 1 ? [numbers[0], numbers[0]] : [numbers[0], numbers[1]];
}

function stripGuidePrefix(summary: string): string {
  return summary.replace(/^장금이\s*(표준|레시피|배출)?\s*가이드:\s*/, "");
}

function adaptStorageComment(
  method: z.infer<typeof ApiStorageMethodSchema>,
): Ingredient["storage"]["methods"][number]["comment"] {
  if (method.comment?.text) {
    return {
      author: method.comment.author ?? { name: "장금이", type: "curator" },
      text: method.comment.text,
    };
  }

  if (method.janggeumiComment) {
    return {
      author: { name: "장금이", type: "curator" },
      text: method.janggeumiComment,
    };
  }

  return undefined;
}

function isDisposeLike(value: string): boolean {
  return /폐기|쓰레기|분리배출|배출/.test(value);
}

function isRecipeLike(value: string): boolean {
  return /레시피|요리|무침|통조림|병조림|재탄생/.test(value);
}

function normalizeWasteType(
  value: "food" | "general" | "recycle" | undefined,
  way: string,
): "food" | "general" | "recycle" {
  if (/재활용|분리수거/.test(way)) return "recycle";
  if (/음식물/.test(way)) return "food";
  if (/일반|종량제/.test(way)) return "general";
  return value ?? "general";
}
