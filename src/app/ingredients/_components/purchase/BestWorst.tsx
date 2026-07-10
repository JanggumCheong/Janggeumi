"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import type { BestWorst as BestWorstData } from "../../_lib/types";

/**
 * 좋은/피할 예시 대비 — 초보가 눈으로 먼저 학습.
 * ⚠️ 직관성이 핵심 → **이미지만** 보여준다(텍스트 캡션 없음). 아래 기준 카드와 중복 방지.
 * 색은 상단 라벨(👍초록/👎빨강)에만, 이미지 배경은 무채색(사진 선명).
 * 카피는 재료 무관 — 재료명 하드코딩 X. 데이터의 hint는 메타(접근성 alt 등)로만 쓴다.
 * 이미지는 API의 good_case/bad_case로 대응한다(이모지 자리표시 없음 — 없으면 빈 배경).
 */
export function BestWorst({ data }: { data: BestWorstData }) {
  return (
    <div className="flex gap-2.5">
      <Col
        variant="good"
        label="👍 이런 걸 고르세요"
        image={data.good.image}
        alt={data.good.hint}
      />
      <Col
        variant="bad"
        label="👎 이건 피하세요"
        image={data.bad.image}
        alt={data.bad.hint}
      />
    </div>
  );
}

function Col({
  variant,
  label,
  image,
  alt,
}: {
  variant: "good" | "bad";
  label: string;
  image?: string | null;
  /** 이미지 대체 텍스트(접근성) — 화면엔 안 보임. */
  alt?: string;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const hasImageError = failedImage === image;

  return (
    <div className="flex-1 overflow-hidden rounded-[16px] border border-border">
      {/* 라벨 (색은 여기만) */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-[7px] text-xs font-extrabold text-white"
        style={{ backgroundColor: variant === "good" ? "#1F804D" : "#C1453B" }}
      >
        {label}
      </div>
      {/* 이미지만 (무채색 배경). image 없으면 빈 배경. */}
      <div className="flex h-32 items-center justify-center bg-muted text-muted-foreground">
        {image && !hasImageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={alt ?? ""}
            className="h-full w-full object-cover"
            onError={() => setFailedImage(image)}
          />
        ) : (
          <ImageOff className="size-6 opacity-55" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
