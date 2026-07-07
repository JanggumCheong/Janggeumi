import { notFound } from "next/navigation";
import {
  DisposeDetail,
  RecipeDetail,
  StorageMethodDetail,
} from "../../../../_components/detail/IngredientDetailViews";
import { getIngredient, getIngredientSlugs } from "../../../../_lib/ingredients";

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

export default async function IngredientDetailPage({
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
