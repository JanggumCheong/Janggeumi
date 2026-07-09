import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 장금이 프로필 아바타 — 브랜드 캐릭터(public/apple-touch-icon.png)를 원형으로.
 * 정식 캐릭터 아트 확정 시 이미지 경로만 교체하면 된다.
 * 목업: docs/mockups/mypage-mockup.html
 */
export function ProfileAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-19.5 shrink-0 overflow-hidden rounded-full border-2 border-primary bg-secondary",
        className,
      )}
    >
      <Image
        src="/apple-touch-icon.png"
        alt="장금이 프로필"
        width={78}
        height={78}
        className="size-full rounded-full object-cover"
        priority
      />
    </div>
  );
}
