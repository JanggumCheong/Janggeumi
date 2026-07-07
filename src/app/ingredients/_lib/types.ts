/**
 * 재료 상세 데이터 스키마 + 타입 (content/schema.md 규약 기준).
 *
 * Zod 스키마를 진실의 원천(single source of truth)으로 삼는다:
 * - 타입은 스키마에서 자동 생성(z.infer) — 스키마와 타입이 절대 어긋나지 않음.
 * - 로더에서 parse()로 런타임 검증 — JSON이 스키마와 안 맞으면 로드 시점에 에러.
 * "구조는 고정, 값만 재료별로 가변" — 화면은 배열을 렌더만 하면 된다.
 */
import { z } from "zod";

// ── 공통 ────────────────────────────────────────────────

export const SourceSchema = z.object({
  org: z.string(),
  type: z.enum(["official", "expert", "media", "community"]),
  mediaType: z.enum(["article", "pdf", "video", "dataset"]).optional(),
  url: z.string().optional(),
  verified: z.boolean().optional(),
  lastReviewed: z.string().optional(),
});

export const MediaSchema = z.object({
  type: z.enum(["video", "image"]),
  provider: z.string().optional(),
  url: z.string(),
  title: z.string().optional(),
  thumbnail: z.string().nullable().optional(),
  creator: z.string().optional(),
});

export const FactSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
});

/**
 * 화자 — 코멘트·레시피의 작성 주체.
 * type으로 화자 종류 구분: curator(장금이 큐레이션) / ugc(유저) / official(전문가·기관).
 * 지금 데이터는 대부분 curator(장금이)지만, 로그인·UGC 후속에서 ugc·official로 확장된다.
 */
export const AuthorSchema = z.object({
  name: z.string(),
  type: z.enum(["ugc", "official", "curator"]),
});

/**
 * 코멘트 — 방법·레시피에 붙는 한마디(후기 대체 신뢰 근거).
 * 화자(author)를 데이터로 들고 있어, 화면이 화자명을 하드코딩하지 않고 유저·전문가로 확장 가능.
 */
export const CommentSchema = z.object({
  author: AuthorSchema,
  text: z.string(),
});

// ── 구매 (정답형) ───────────────────────────────────────

export const PurchaseCriterionSchema = z.object({
  key: z.string(),
  title: z.string(),
  desc: z.string(),
  image: z.string().nullable().optional(),
  source: SourceSchema.optional(),
});

/**
 * 좋은/피할 예시 대비 (BestWorst) — 초보가 눈으로 학습.
 * image=실제 사진, hint=짧은 대비 포인트. 카피는 재료 무관이라 데이터엔 재료명 없음.
 */
export const BestWorstExampleSchema = z.object({
  image: z.string().nullable().optional(),
  hint: z.string().optional(),
});
export const BestWorstSchema = z.object({
  good: BestWorstExampleSchema,
  bad: BestWorstExampleSchema,
});

export const PurchaseSchema = z.object({
  headline: z.string(),
  bestWorst: BestWorstSchema.optional(),
  criteria: z.array(PurchaseCriterionSchema),
});

// ── 보관 (합의형) ───────────────────────────────────────

/** 필터 축 정의. 재료마다 축이 다르다(동적). key로 method.tags와 매칭. */
export const StorageFilterSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(z.string()),
});

export const RatingSchema = z.object({
  avg: z.number(),
  count: z.number(),
  dist: z.record(z.string(), z.number()).optional(),
});

export const StorageStepSchema = z.object({
  no: z.number(),
  title: z.string(),
  desc: z.string(),
  image: z.string().nullable().optional(),
});

/** 보관 방법. tags가 filters의 각 축 값과 1:1로 매칭되어 필터링된다. */
export const StorageMethodSchema = z.object({
  id: z.string(),
  title: z.string(),
  recommended: z.boolean().optional(),
  /** { form: "통째로", place: "실온", period: "단기" } — filter.key → 선택값 */
  tags: z.record(z.string(), z.string()),
  summary: z.string(),
  durationDays: z.tuple([z.number(), z.number()]).optional(),
  conditions: z.record(z.string(), z.string()).optional(),
  steps: z.array(StorageStepSchema).optional(),
  goodFor: z.array(z.string()).optional(),
  notFor: z.array(z.string()).optional(),
  cautions: z.array(z.string()).optional(),
  rating: RatingSchema.optional(),
  source: SourceSchema.optional(),
  media: z.array(MediaSchema).optional(),
  /** 코멘트(후기 대체 — 검증된 큐레이션). 화자(author)를 데이터로 — 지금은 장금이(curator), 향후 유저·전문가 확장. */
  comment: CommentSchema.optional(),
});

export const StorageSchema = z.object({
  headline: z.string(),
  intro: z.string().optional(),
  filters: z.array(StorageFilterSchema),
  methods: z.array(StorageMethodSchema),
  tip: z.string().optional(),
});

// ── 처리 (확산형) ───────────────────────────────────────

/** 활용 처리 — 레시피 UGC 하나. */
export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().optional(),
  desc: z.string(),
  image: z.string().nullable().optional(),
  author: AuthorSchema,
  reaction: z.object({ likes: z.number(), comments: z.number() }).optional(),
  source: SourceSchema.nullable().optional(),
  media: z.array(MediaSchema).optional(),
});

/**
 * 폐기 처리 — 분리배출 안내 하나.
 * 카드 = 요약(way + wasteType). 상세 필드는 전부 선택(근거 있는 것만 채움 — 추측 금지).
 * steps는 보관과 동일 구조(StorageStepSchema 재사용).
 */
export const DisposeItemSchema = z.object({
  key: z.string(),
  title: z.string(),
  way: z.string(),
  wasteType: z.enum(["food", "general", "recycle"]),
  image: z.string().nullable().optional(),
  // ↓ 상세 페이지용 (모두 선택)
  reason: z.string().optional(),
  steps: z.array(StorageStepSchema).optional(),
  cautions: z.array(z.string()).optional(),
  regionNote: z.string().optional(),
  source: SourceSchema.optional(),
  detailHref: z.string().nullable().optional(),
});

export const HandlingSchema = z.object({
  headline: z.string(),
  intro: z.string().optional(),
  recipes: z.array(RecipeSchema),
  /** 폐기 처리 안내 (신설). 없을 수 있음. */
  dispose: z.array(DisposeItemSchema).optional(),
});

// ── 재료 상세 (루트) ────────────────────────────────────

export const IngredientCategorySchema = z.enum([
  "fruit",
  "vegetable",
  "meat",
  "seafood",
  "grain",
]);

/** 함께 보면 좋은 콘텐츠. */
export const RelatedSchema = z.object({
  title: z.string(),
  desc: z.string(),
  href: z.string(),
  image: z.string().nullable().optional(),
});

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()).optional(),
  category: IngredientCategorySchema,
  emoji: z.string(),
  summary: z.string(),
  seasonMonths: z.array(z.number()).optional(),
  facts: z.array(FactSchema).optional(),
  purchase: PurchaseSchema,
  storage: StorageSchema,
  handling: HandlingSchema,
  related: z.array(RelatedSchema).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

// ── 타입은 스키마에서 자동 생성 (스키마 ↔ 타입 항상 일치) ──

export type Source = z.infer<typeof SourceSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type Fact = z.infer<typeof FactSchema>;
export type PurchaseCriterion = z.infer<typeof PurchaseCriterionSchema>;
export type BestWorstExample = z.infer<typeof BestWorstExampleSchema>;
export type BestWorst = z.infer<typeof BestWorstSchema>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export type StorageFilter = z.infer<typeof StorageFilterSchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type StorageStep = z.infer<typeof StorageStepSchema>;
export type StorageMethod = z.infer<typeof StorageMethodSchema>;
export type Storage = z.infer<typeof StorageSchema>;
export type Author = z.infer<typeof AuthorSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type DisposeItem = z.infer<typeof DisposeItemSchema>;
export type Handling = z.infer<typeof HandlingSchema>;
export type IngredientCategory = z.infer<typeof IngredientCategorySchema>;
export type Related = z.infer<typeof RelatedSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;

/** 상세 탭. URL 세그먼트와 1:1. */
export type IngredientTab = "purchase" | "storage" | "handling";
export const INGREDIENT_TABS: IngredientTab[] = [
  "purchase",
  "storage",
  "handling",
];
export const TAB_LABEL: Record<IngredientTab, string> = {
  purchase: "구매",
  storage: "보관",
  handling: "처리",
};
