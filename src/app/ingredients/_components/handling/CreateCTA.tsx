import { PenLine } from "lucide-react";

/**
 * 활용 처리 하단 작성 CTA (H3: UGC 유도 — 확산형은 참여로 콘텐츠가 늘어남).
 * 활용 탭에서만 노출(호출부가 결정). 재료명은 데이터로 받아 카피 구성.
 * 실제 작성 플로우는 추후 — 지금은 표시만(준비중).
 */
export function CreateCTA({ ingredientName }: { ingredientName: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-1.5 rounded-[16px] bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-jg-primary-strong"
    >
      <PenLine className="size-4" />
      나만의 {ingredientName} 활용법 공유하기
    </button>
  );
}
