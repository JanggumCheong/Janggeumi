import Link from "next/link";
import { ChevronLeft, Heart, Share } from "lucide-react";

/** 재료 상세 상단 앱바 — 뒤로 · 재료명(가운데) · ♡ ↑. */
export function AppBar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between bg-card px-2 py-2">
      <Link
        href="/ingredients"
        aria-label="뒤로"
        className="flex size-9 items-center justify-center rounded-full text-jg-ink-sub hover:bg-muted"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <h1 className="text-[17px] font-extrabold">{title}</h1>
      <div className="flex gap-1">
        <button
          aria-label="찜"
          className="flex size-9 items-center justify-center rounded-full text-jg-ink-sub hover:bg-muted"
        >
          <Heart className="size-5" />
        </button>
        <button
          aria-label="공유"
          className="flex size-9 items-center justify-center rounded-full text-jg-ink-sub hover:bg-muted"
        >
          <Share className="size-5" />
        </button>
      </div>
    </header>
  );
}
