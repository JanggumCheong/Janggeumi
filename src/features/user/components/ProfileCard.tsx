import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "./ProfileAvatar";
import type { MyProfile } from "../data";

/**
 * 장금이 정보 카드 — 아바타 + 레벨 배지 + 이름 + 상태 + XP 진행률.
 * 목업: docs/mockups/mypage-mockup.html (ProfileCard)
 */
export function ProfileCard({ profile }: { profile: MyProfile }) {
  const { nickname, level, tier, xp, xpToNext } = profile;
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));

  return (
    <section className="rounded-lg bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-center gap-4">
        <ProfileAvatar />
        <div className="flex min-w-0 flex-col gap-2">
          <Badge className="self-start px-2.5 py-1 text-xs font-extrabold">
            Lv.{level} {tier}
          </Badge>
          <span className="text-xl font-extrabold leading-tight text-foreground">{nickname}님</span>
        </div>
      </div>

      {/* XP 진행률 */}
      <div className="mt-4.5 flex flex-col gap-1">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-semibold text-muted-foreground">다음 레벨까지</span>
          <span className="text-xs font-extrabold text-primary">
            {xp.toLocaleString()}{" "}
            <span className="font-semibold text-jg-ink-mute">/ {xpToNext.toLocaleString()} XP</span>
          </span>
        </div>
        <div
          className="h-2.25 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="다음 레벨까지 진행률"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
}
