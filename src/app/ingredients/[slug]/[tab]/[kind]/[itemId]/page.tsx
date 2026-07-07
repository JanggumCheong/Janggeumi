import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  ExternalLink,
  Heart,
  MessageCircle,
  PlayCircle,
  Share2,
  Star,
  ThumbsUp,
} from "lucide-react";
import { getIngredient, getIngredientSlugs } from "../../../../_lib/ingredients";
import type { Rating, StorageMethod } from "../../../../_lib/types";

export function generateStaticParams() {
  return getIngredientSlugs().flatMap((slug) => {
    const ingredient = getIngredient(slug);

    if (!ingredient) return [];

    return [
      ...ingredient.storage.methods.map((method) => ({
        slug,
        tab: "storage",
        kind: "methods",
        itemId: method.id,
      })),
      ...ingredient.handling.recipes.map((recipe) => ({
        slug,
        tab: "handling",
        kind: "recipes",
        itemId: recipe.id,
      })),
      ...(ingredient.handling.dispose ?? []).map((item) => ({
        slug,
        tab: "handling",
        kind: "dispose",
        itemId: item.key,
      })),
    ];
  });
}

export default async function StorageMethodDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
    tab: string;
    kind: string;
    itemId: string;
  }>;
}) {
  const { slug, tab, kind, itemId } = await params;
  const ingredient = getIngredient(slug);
  if (!ingredient) notFound();

  if (tab === "storage" && kind === "methods") {
    const method = ingredient.storage.methods.find((item) => item.id === itemId);
    if (!method) notFound();
    return <StorageMethodDetail slug={slug} ingredient={ingredient} method={method} />;
  }

  if (tab === "handling" && kind === "recipes") {
    const recipe = ingredient.handling.recipes.find((item) => item.id === itemId);
    if (!recipe) notFound();
    return <RecipeDetail slug={slug} ingredient={ingredient} recipe={recipe} />;
  }

  if (tab === "handling" && kind === "dispose") {
    const item = ingredient.handling.dispose?.find((entry) => entry.key === itemId);
    if (!item) notFound();
    return <DisposeDetail slug={slug} ingredient={ingredient} item={item} />;
  }

  notFound();
}

function StorageMethodDetail({
  slug,
  ingredient,
  method,
}: {
  slug: string;
  ingredient: NonNullable<ReturnType<typeof getIngredient>>;
  method: NonNullable<ReturnType<typeof getIngredient>>["storage"]["methods"][number];
}) {
  const otherMethods = ingredient.storage.methods.filter((item) => item.id !== method.id);
  const nextRecipes = ingredient.handling.recipes.slice(0, 2);

  return (
    <article className="flex flex-col gap-4 pb-4">
      <section className="relative overflow-hidden rounded-[24px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(31,29,24,0.05)]">
        <div className="absolute -right-10 top-10 size-44 rounded-full bg-jg-keep-bg" />
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1 text-[11px] font-bold text-muted-foreground">
              <span>{ingredient.name}</span>
              <ChevronRight className="size-3" />
              <span>보관 방법</span>
            </div>
            <div className="flex gap-2 text-muted-foreground">
              <Heart className="size-5" />
              <Share2 className="size-5" />
            </div>
          </div>

          {method.recommended && (
            <span className="mb-2 inline-flex rounded-full bg-primary px-2.5 py-1 text-[11px] font-extrabold text-primary-foreground">
              추천
            </span>
          )}

          <h1 className="max-w-[230px] text-[28px] font-extrabold leading-[1.18]">
            {shortTitle(method.title)}
          </h1>

          {method.rating && (
            <div className="mt-2 inline-flex items-center gap-1 text-sm font-extrabold">
              <Star className="size-4 fill-current text-jg-star" />
              <span>{method.rating.avg}</span>
              <span className="font-medium text-muted-foreground">
                ({method.rating.count.toLocaleString()})
              </span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.values(method.tags).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-extrabold text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            {method.durationDays && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-extrabold text-muted-foreground">
                #{method.durationDays[0]}-{method.durationDays[1]}일
              </span>
            )}
            {method.conditions?.temp && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-extrabold text-muted-foreground">
                #{method.conditions.temp}
              </span>
            )}
          </div>

          <div className="mt-8 flex items-end justify-between gap-3">
            <p className="max-w-[190px] text-sm leading-[1.55] text-foreground">{method.summary}</p>
            <div className="flex size-32 flex-none items-center justify-center rounded-[28px] bg-gradient-to-br from-jg-keep-bg to-white text-[72px] shadow-[0_10px_24px_rgba(31,29,24,0.08)]">
              {thumbFor(method)}
            </div>
          </div>
        </div>
      </section>

      <FitSection goodFor={method.goodFor} notFor={method.notFor} />
      <StepSection method={method} />
      <CautionSection method={method} />
      <TemperatureSection temp={method.conditions?.temp} />
      <ReviewSummary rating={method.rating} />
      <OtherMethods slug={slug} methods={otherMethods} />
      <NextRecipes slug={slug} recipes={nextRecipes} />
      <ReferenceLinks method={method} />
    </article>
  );
}

function RecipeDetail({
  slug,
  ingredient,
  recipe,
}: {
  slug: string;
  ingredient: NonNullable<ReturnType<typeof getIngredient>>;
  recipe: NonNullable<ReturnType<typeof getIngredient>>["handling"]["recipes"][number];
}) {
  return (
    <article className="flex flex-col gap-4 pb-4">
      <section className="relative overflow-hidden rounded-[24px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(31,29,24,0.05)]">
        <div className="absolute -right-10 top-10 size-44 rounded-full bg-jg-use-bg" />
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1 text-[11px] font-bold text-muted-foreground">
              <span>{ingredient.name}</span>
              <ChevronRight className="size-3" />
              <span>활용 처리</span>
            </div>
            <div className="flex gap-2 text-muted-foreground">
              <Heart className="size-5" />
              <Share2 className="size-5" />
            </div>
          </div>

          {recipe.category && (
            <span className="mb-2 inline-flex rounded-full bg-jg-use px-2.5 py-1 text-[11px] font-extrabold text-white">
              {recipe.category}
            </span>
          )}

          <h1 className="max-w-[250px] text-[28px] font-extrabold leading-[1.18]">
            {recipe.title}
          </h1>
          <p className="mt-3 max-w-[230px] text-sm leading-[1.55] text-foreground">{recipe.desc}</p>

          <div className="mt-8 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-muted-foreground">작성자</div>
              <div className="mt-1 text-sm font-extrabold">{recipe.author.name}</div>
              {recipe.reaction && (
                <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3" />
                    {formatCount(recipe.reaction.likes)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3" />
                    {recipe.reaction.comments}
                  </span>
                </div>
              )}
            </div>
            <div className="flex size-28 flex-none items-center justify-center rounded-[28px] bg-gradient-to-br from-jg-use-bg to-white text-[64px] shadow-[0_10px_24px_rgba(31,29,24,0.08)]">
              {recipe.category === "음료" ? "🥤" : "🍽"}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border border-border bg-card p-5">
        <h2 className="text-base font-extrabold">활용 방법</h2>
        <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">
          지금 데이터에는 재료·조리 순서·소요 시간이 따로 없어서 카드 설명을 중심으로 보여줍니다.
          상세 단계 데이터가 추가되면 이 영역에 단계형 레시피를 연결합니다.
        </p>
      </section>

      {recipe.media && recipe.media.length > 0 && (
        <section className="rounded-[20px] border border-border bg-card p-5">
          <h2 className="text-base font-extrabold">같이 보면 좋아요</h2>
          <div className="mt-3 flex flex-col gap-2">
            {recipe.media.map((media) => (
              <Link
                key={media.url}
                href={media.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-[14px] bg-muted p-3 text-sm font-bold"
              >
                <PlayCircle className="size-4 text-jg-use" />
                <span className="min-w-0 flex-1 truncate">{media.title ?? "참고 영상"}</span>
                <ExternalLink className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link
        href={`/ingredients/${slug}/handling`}
        className="rounded-[16px] bg-primary px-4 py-3 text-center text-sm font-extrabold text-primary-foreground"
      >
        처리 목록으로 돌아가기
      </Link>
    </article>
  );
}

const WASTE_LABEL = {
  food: "음식물 쓰레기",
  general: "일반 쓰레기",
  recycle: "재활용",
} as const;

function DisposeDetail({
  slug,
  ingredient,
  item,
}: {
  slug: string;
  ingredient: NonNullable<ReturnType<typeof getIngredient>>;
  item: NonNullable<NonNullable<ReturnType<typeof getIngredient>>["handling"]["dispose"]>[number];
}) {
  return (
    <article className="flex flex-col gap-4 pb-4">
      <section className="relative overflow-hidden rounded-[24px] border border-border bg-card p-5 shadow-[0_2px_10px_rgba(31,29,24,0.05)]">
        <div className="absolute -right-10 top-10 size-44 rounded-full bg-jg-use-bg" />
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1 text-[11px] font-bold text-muted-foreground">
              <span>{ingredient.name}</span>
              <ChevronRight className="size-3" />
              <span>폐기 처리</span>
            </div>
            <Share2 className="size-5 text-muted-foreground" />
          </div>

          <span className="mb-2 inline-flex rounded-full bg-jg-use px-2.5 py-1 text-[11px] font-extrabold text-white">
            {WASTE_LABEL[item.wasteType]}
          </span>
          <h1 className="max-w-[250px] text-[28px] font-extrabold leading-[1.18]">{item.title}</h1>
          <p className="mt-3 max-w-[230px] text-sm leading-[1.55] text-foreground">{item.way}</p>

          <div className="mt-8 flex justify-end">
            <div className="flex size-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-jg-use-bg to-white text-[64px] shadow-[0_10px_24px_rgba(31,29,24,0.08)]">
              {disposeThumb(item.key)}
            </div>
          </div>
        </div>
      </section>

      {item.reason && (
        <section className="rounded-[20px] border border-border bg-card p-5">
          <h2 className="text-base font-extrabold">왜 이렇게 버리나요?</h2>
          <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">{item.reason}</p>
        </section>
      )}

      <section className="rounded-[20px] border border-border bg-card p-5">
        <h2 className="text-base font-extrabold">배출 방법 ({item.steps?.length ?? 0}단계)</h2>
        {item.steps && item.steps.length > 0 ? (
          <div className="mt-4 flex flex-col divide-y divide-border">
            {item.steps.map((step) => (
              <div key={step.no} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex size-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
                  {step.no}
                </div>
                <div>
                  <div className="text-[15px] font-extrabold">{step.title}</div>
                  <p className="mt-1 text-sm leading-[1.55] text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-[1.55] text-muted-foreground">
            상세 배출 단계는 출처 확인 후 추가합니다. 지금은 카드의 요약 방법을 기준으로 확인해
            주세요.
          </p>
        )}
      </section>

      {item.cautions && item.cautions.length > 0 && (
        <section className="rounded-[20px] bg-jg-use-bg p-5">
          <h2 className="text-base font-extrabold">주의사항</h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {item.cautions.map((caution) => (
              <li key={caution} className="flex gap-2 text-sm leading-[1.5]">
                <span className="text-primary">●</span>
                <span>{caution}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.regionNote && (
        <section className="rounded-[20px] bg-muted p-5">
          <h2 className="text-base font-extrabold">지역 차이 안내</h2>
          <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">{item.regionNote}</p>
        </section>
      )}

      {item.source?.url && (
        <section className="rounded-[20px] border border-border bg-card p-5">
          <h2 className="text-base font-extrabold">참고 링크</h2>
          <Link
            href={item.source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-3 text-sm font-bold"
          >
            <span className="min-w-0 flex-1 truncate">{item.source.org}</span>
            <ExternalLink className="size-4 flex-none text-muted-foreground" />
          </Link>
        </section>
      )}

      <Link
        href={`/ingredients/${slug}/handling`}
        className="rounded-[16px] bg-primary px-4 py-3 text-center text-sm font-extrabold text-primary-foreground"
      >
        처리 목록으로 돌아가기
      </Link>
    </article>
  );
}

function FitSection({ goodFor, notFor }: { goodFor?: string[]; notFor?: string[] }) {
  if ((!goodFor || goodFor.length === 0) && (!notFor || notFor.length === 0)) {
    return null;
  }

  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      {goodFor && goodFor.length > 0 && (
        <>
          <h2 className="text-base font-extrabold">이럴 때 좋아요 👍</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {goodFor.map((item) => (
              <li key={item} className="flex gap-2 text-sm font-bold">
                <span className="text-primary">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {notFor && notFor.length > 0 && (
        <div className={goodFor && goodFor.length > 0 ? "mt-4 border-t border-border pt-4" : ""}>
          <h2 className="text-base font-extrabold text-jg-use">이럴 때는 안 맞아요 👎</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {notFor.map((item) => (
              <li key={item} className="flex gap-2 text-sm font-bold text-muted-foreground">
                <span>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function StepSection({ method }: { method: StorageMethod }) {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <h2 className="text-base font-extrabold">따라 하기 ({method.steps?.length ?? 0}단계)</h2>
      {method.steps && method.steps.length > 0 ? (
        <div className="mt-4 flex flex-col divide-y divide-border">
          {method.steps.map((step) => (
            <div key={step.no} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <div className="flex size-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
                {step.no}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-extrabold">{step.title}</div>
                <p className="mt-1 text-sm leading-[1.55] text-muted-foreground">{step.desc}</p>
              </div>
              <div className="flex size-24 flex-none items-center justify-center rounded-[16px] bg-muted text-4xl">
                {step.no === 4 ? "📅" : thumbFor(method)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-[1.55] text-muted-foreground">
          상세 단계는 아직 준비 중이에요.
        </p>
      )}
    </section>
  );
}

function CautionSection({ method }: { method: StorageMethod }) {
  if (!method.cautions || method.cautions.length === 0) return null;

  return (
    <section className="rounded-[20px] bg-jg-use-bg p-5">
      <h2 className="text-base font-extrabold">주의사항</h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {method.cautions.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-[1.5]">
            <span className="text-primary">●</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TemperatureSection({ temp }: { temp?: string }) {
  if (!temp) return null;

  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <div className="text-xs font-bold text-muted-foreground">적정 온도</div>
      <div className="mt-2 text-[30px] font-extrabold">{temp}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-2/3 rounded-full bg-primary" />
      </div>
      <p className="mt-2 text-xs leading-[1.5] text-muted-foreground">
        너무 덥거나 습하면 피해 주세요.
      </p>
    </section>
  );
}

function ReviewSummary({ rating }: { rating?: Rating }) {
  if (!rating) return null;
  const dist = rating.dist ?? {};

  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <h2 className="text-base font-extrabold">사용자 후기 ({rating.count.toLocaleString()})</h2>
      <div className="mt-3 flex items-end gap-2">
        <Star className="mb-1 size-7 fill-current text-jg-star" />
        <span className="text-[34px] font-extrabold leading-none">{rating.avg}</span>
        <span className="pb-1 text-sm font-bold text-muted-foreground">/5</span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map((score) => {
          const value = dist[String(score)] ?? 0;
          return (
            <div key={score} className="grid grid-cols-[28px_1fr_36px] items-center gap-2 text-xs">
              <span className="text-muted-foreground">{score}점</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
              </div>
              <span className="text-right font-bold text-muted-foreground">{value}%</span>
            </div>
          );
        })}
      </div>
      <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-[14px] border border-primary/40 py-3 text-sm font-extrabold text-primary">
        <ThumbsUp className="size-4" /> 후기 작성하기
      </button>
    </section>
  );
}

function OtherMethods({ slug, methods }: { slug: string; methods: StorageMethod[] }) {
  if (methods.length === 0) return null;

  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <h2 className="text-base font-extrabold">다른 보관 방법도 알아보세요</h2>
      <div className="mt-3 flex flex-col divide-y divide-border">
        {methods.map((method) => (
          <Link
            key={method.id}
            href={`/ingredients/${slug}/storage/methods/${method.id}`}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex size-12 flex-none items-center justify-center rounded-[14px] bg-muted text-2xl">
              {thumbFor(method)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{method.title}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.values(method.tags)
                  .slice(0, 3)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
              {method.rating && (
                <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-jg-star">
                  <Star className="size-3 fill-current" />
                  {method.rating.avg}
                  <span className="text-muted-foreground">
                    ({method.rating.count.toLocaleString()})
                  </span>
                </div>
              )}
            </div>
            <ChevronRight className="size-4 flex-none text-muted-foreground" />
          </Link>
        ))}
      </div>
      <Link
        href={`/ingredients/${slug}/storage`}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-[14px] border border-primary/40 py-3 text-sm font-extrabold text-primary"
      >
        모든 보관 방법 보기 <ChevronRight className="size-4" />
      </Link>
    </section>
  );
}

function NextRecipes({
  slug,
  recipes,
}: {
  slug: string;
  recipes: NonNullable<ReturnType<typeof getIngredient>>["handling"]["recipes"];
}) {
  if (recipes.length === 0) return null;

  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <h2 className="text-base font-extrabold">다음에 활용해보세요</h2>
      <div className="mt-3 flex flex-col divide-y divide-border">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/ingredients/${slug}/handling/recipes/${recipe.id}`}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex size-12 flex-none items-center justify-center rounded-[14px] bg-jg-use-bg text-2xl">
              {recipe.category === "음료" ? "🥤" : "🍽"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{recipe.title}</div>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{recipe.desc}</p>
            </div>
            <ChevronRight className="size-4 flex-none text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ReferenceLinks({ method }: { method: StorageMethod }) {
  const links = [
    method.source?.url
      ? {
          title: `${method.source.org} 자료`,
          url: method.source.url,
        }
      : null,
    ...(method.media ?? []).map((item) => ({
      title: item.title ?? item.creator ?? "참고 자료",
      url: item.url,
    })),
  ].filter((item): item is { title: string; url: string } => Boolean(item));

  if (links.length === 0) return null;

  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <h2 className="text-base font-extrabold">참고 링크</h2>
      <div className="mt-3 flex flex-col divide-y divide-border">
        {links.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 py-3 text-sm font-bold first:pt-0 last:pb-0"
          >
            <span className="min-w-0 flex-1 truncate">{link.title}</span>
            <ExternalLink className="size-4 flex-none text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function shortTitle(title: string): string {
  return title.replace(/\s*\(.+\)\s*$/, "");
}

function thumbFor(method: StorageMethod): string {
  const place = method.tags.place;
  if (place === "냉동") return "🧊";
  if (place === "냉장") return "❄️";
  if (place === "실온") return "🍉";
  return "📦";
}

function disposeThumb(key: string): string {
  if (key === "rind") return "🍉";
  if (key === "seed") return "🌰";
  if (key === "wrap") return "🕸";
  return "🗑";
}

function formatCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(value);
}
