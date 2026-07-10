"use client";

import { useState } from "react";
import type { BestWorst as BestWorstData } from "../../_lib/types";

/**
 * 좋은/피할 예시 대비 — 초보가 눈으로 먼저 학습.
 * ⚠️ 직관성이 핵심 → **이미지만** 보여준다(텍스트 캡션 없음). 아래 기준 카드와 중복 방지.
 * 색은 상단 라벨(👍초록/👎빨강)에만, 이미지 배경은 무채색(사진 선명).
 * 카피는 재료 무관 — 재료명 하드코딩 X. 데이터의 hint는 메타(접근성 alt 등)로만 쓴다.
 * 이미지는 API의 good_case/bad_case로 대응한다 — 없거나 로드 실패하면 placeholder.
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
      <Col variant="bad" label="👎 이건 피하세요" image={data.bad.image} alt={data.bad.hint} />
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
  // 로드 실패(잘못된 경로 404 등) 시 broken-image 대신 placeholder로 대체.
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(image) && !failed;

  return (
    <div className="flex-1 overflow-hidden rounded-[16px]">
      {/* 라벨 (색은 여기만) */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-[7px] text-xs font-extrabold text-white"
        style={{ backgroundColor: variant === "good" ? "#1F804D" : "#C1453B" }}
      >
        {label}
      </div>
      {/* 이미지 영역 — 모서리는 부모 overflow-hidden이 책임짐.
          이미지 없거나 로드 실패하면 placeholder(아이콘+텍스트)로 대체해 빈 회색/깨진 아이콘을 없앤다. */}
      <div className="h-32 bg-muted">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image!}
            alt={alt ?? ""}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-jg-ink-sub"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-[11px] font-medium opacity-70">이미지 준비중</span>
          </div>
        )}
      </div>
    </div>
  );
}
