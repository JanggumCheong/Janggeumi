import type { BestWorst as BestWorstData } from "../../_lib/types";

/**
 * 좋은/피할 예시 대비 — 초보가 눈으로 먼저 학습.
 * ⚠️ 직관성이 핵심 → **이미지만** 보여준다(텍스트 캡션 없음). 아래 기준 카드와 중복 방지.
 * 색은 상단 라벨(👍초록/👎빨강)에만, 이미지 배경은 무채색(사진 선명).
 * 카피는 재료 무관 — 재료명 하드코딩 X. 데이터의 hint는 메타(접근성 alt 등)로만 쓴다.
 */
export function BestWorst({
  data,
  goodEmoji = "🥗",
  badEmoji = "🥀",
}: {
  data: BestWorstData;
  /** 이미지 확보 전 자리표시 이모지. */
  goodEmoji?: string;
  badEmoji?: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Col
        variant="good"
        label="👍 이런 걸 고르세요"
        image={data.good.image}
        alt={data.good.hint}
        emoji={goodEmoji}
      />
      <Col
        variant="bad"
        label="👎 이건 피하세요"
        image={data.bad.image}
        alt={data.bad.hint}
        emoji={badEmoji}
      />
    </div>
  );
}

function Col({
  variant,
  label,
  image,
  alt,
  emoji,
}: {
  variant: "good" | "bad";
  label: string;
  image?: string | null;
  /** 이미지 대체 텍스트(접근성) — 화면엔 안 보임. */
  alt?: string;
  emoji: string;
}) {
  return (
    <div className="flex-1 overflow-hidden rounded-[16px] border border-border">
      {/* 라벨 (색은 여기만) */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-[7px] text-xs font-extrabold text-white"
        style={{ backgroundColor: variant === "good" ? "#1F804D" : "#C1453B" }}
      >
        {label}
      </div>
      {/* 이미지만 (무채색 배경). image 있으면 그것, 없으면 이모지 자리표시. */}
      <div className="flex h-32 items-center justify-center bg-card text-[60px]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={alt ?? ""} className="h-full w-full object-cover" />
        ) : (
          <span
            role="img"
            aria-label={alt}
            style={variant === "bad" ? { filter: "grayscale(.4)" } : undefined}
          >
            {emoji}
          </span>
        )}
      </div>
    </div>
  );
}
