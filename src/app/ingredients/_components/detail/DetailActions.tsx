"use client";

import { useMemo, useState } from "react";
import { Check, Heart, LinkIcon, Share2, X } from "lucide-react";

export function DetailActions() {
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const canShare = useMemo(() => typeof navigator !== "undefined" && Boolean(navigator.share), []);

  const copyLink = async () => {
    if (typeof window === "undefined") return;

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const nativeShare = async () => {
    if (typeof window === "undefined" || !navigator.share) return;

    await navigator.share({
      title: document.title,
      url: window.location.href,
    });
    setOpen(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          aria-pressed={liked}
          onClick={() => setLiked((next) => !next)}
          className="flex size-8 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-[0_2px_8px_rgba(31,29,24,0.08)]"
        >
          <Heart
            className={liked ? "size-5 fill-jg-use text-jg-use" : "size-5 text-muted-foreground"}
          />
        </button>
        <button
          type="button"
          aria-label="공유하기"
          onClick={() => setOpen(true)}
          className="flex size-8 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-[0_2px_8px_rgba(31,29,24,0.08)]"
        >
          <Share2 className="size-5" />
        </button>
      </div>

      {copied && (
        <div className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background shadow-lg">
          <Check className="size-4" />
          링크가 복사됐어요
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/30">
          <button
            type="button"
            aria-label="공유 메뉴 닫기"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full rounded-t-[24px] bg-card p-5 shadow-[0_-12px_28px_rgba(31,29,24,0.16)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">공유하기</h2>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={async () => {
                  await copyLink();
                  setOpen(false);
                }}
                className="flex flex-col items-center gap-2 rounded-[16px] border border-border bg-background p-4 text-sm font-extrabold"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <LinkIcon className="size-5 text-primary" />
                </span>
                링크 복사
              </button>

              <button
                type="button"
                disabled={!canShare}
                onClick={nativeShare}
                className="flex flex-col items-center gap-2 rounded-[16px] border border-border bg-background p-4 text-sm font-extrabold disabled:opacity-40"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Share2 className="size-5 text-primary" />
                </span>
                기기 공유
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
