import { redirect } from "next/navigation";

/** /ingredients/[slug] → 기본 탭(구매)으로 리다이렉트. */
export default async function IngredientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/ingredients/${slug}/purchase`);
}
