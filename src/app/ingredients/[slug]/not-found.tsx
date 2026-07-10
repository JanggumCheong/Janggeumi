"use client";

import { useParams } from "next/navigation";
import { IngredientFallbackSpeech } from "../_components/IngredientFallbackSpeech";

/**
 * 재료 경로 전용 404 — 정식 데이터가 없는 재료(당근 등) 진입 시.
 * 전역 404(빈손 안내) 대신, 장금이가 ai/chat으로 즉석 발화 안내를 띄운다.
 * (전역 not-found는 그대로 — 이 파일은 /ingredients/[slug] 하위 404만 가로챈다.)
 *
 * not-found.tsx는 params를 prop으로 못 받으므로 useParams로 slug를 읽는다(클라 컴포넌트).
 */
export default function IngredientNotFound() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  return <IngredientFallbackSpeech slug={slug} />;
}
