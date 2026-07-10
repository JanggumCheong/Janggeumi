"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { aiChatQuery } from "../_lib/queries/ai-chat";
import { useTypewriter } from "../_lib/useTypewriter";
import janggeumiAvatar from "../../../../assets/images/janggeumi-avatar.png";

/**
 * 없는 재료 발화 안내 — 정식 데이터가 없는 재료에서 장금이가 즉석 발화로 안내.
 * POST /api/ai/chat 로 answer(자유 텍스트)를 받아 장금이 카드로 렌더한다.
 *
 * POST지만 의미는 조회라 useQuery로 감싼다(aiChatQuery) — 캐싱으로 같은 재료 재호출 방지.
 * "임시/AI 생성"을 명시해 정식(검증) 콘텐츠와 구분한다(신뢰 모델 보호).
 * answer는 완성 응답이지만, 타자기 효과로 "AI가 실시간으로 써 내려가는" 느낌을 준다.
 * answer 형식이 매번 조금씩 달라 엄격한 섹션 파싱 대신 줄 단위로 가볍게 렌더한다.
 */
export function IngredientFallbackSpeech({ slug }: { slug: string }) {
  const { data, isPending, isError, refetch } = useQuery(aiChatQuery(slug));
  // 응답이 도착하면 한 글자씩 노출(스트리밍 흉내). 읽으며 따라올 속도(~33자/초).
  const { shown, done } = useTypewriter(data, !!data, { speed: 1, interval: 30 });

  return (
    <div className="flex flex-1 flex-col gap-4 py-4">
      {/* 화자 + 임시 안내 배지 */}
      <div className="flex items-center gap-1.5">
        <Image
          src={janggeumiAvatar}
          alt="장금이"
          width={26}
          height={26}
          className="size-6.5 rounded-full object-cover"
        />
        <span className="text-xs font-extrabold text-primary">장금이 왈,</span>
        <span className="rounded-full bg-jg-use-bg px-2 py-0.5 text-[10px] font-extrabold text-jg-use">
          임시 안내 · AI
        </span>
      </div>

      {/* 몰입 카피 */}
      <p className="text-[22px] font-extrabold leading-[1.35]">
        이 재료는 아직 정리 전이지만
        <br />
        제가 아는 대로 일러드리는 것이옵니다
      </p>

      {/* 발화 카드 */}
      <div className="rounded-[16px] border border-border bg-card p-4">
        {isPending && <SpeechSkeleton />}
        {isError && <ErrorInline onRetry={() => refetch()} />}
        {data && <AnswerBody answer={shown} typing={!done} />}
      </div>

      {/* 정식 콘텐츠 유도 */}
      <p className="text-[13px] text-jg-ink-sub">
        제대로 된 안내는 준비 중이에요. 검증된 재료도 둘러보시겠어요?
      </p>
      <div className="flex gap-2">
        <Link
          href="/search"
          className="flex-1 rounded-[14px] bg-primary py-3 text-center text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          다른 재료 찾아보기
        </Link>
        <Link
          href="/"
          className="rounded-[14px] border border-border px-5 py-3 text-center text-sm font-bold text-jg-ink-sub"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

/**
 * answer(자유 텍스트)를 줄 단위로 가볍게 렌더 — 헤더/리스트/문단만 구분.
 * typing=true면 마지막에 깜빡 커서를 붙여 "쓰는 중"을 보인다.
 */
function AnswerBody({ answer, typing }: { answer: string; typing?: boolean }) {
  const lines = answer.split("\n").map((l) => l.trim());

  return (
    <div className="flex flex-col gap-1.5 text-[14px] leading-relaxed">
      {lines.map((line, i) => {
        if (!line) return null;
        // 리스트 항목
        if (/^[-•*]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2 text-jg-ink-sub">
              <span className="flex-none text-primary">·</span>
              <span>{stripMarks(line.replace(/^[-•*]\s/, ""))}</span>
            </div>
          );
        }
        // 섹션 헤더 (짧고 구매/보관/손질/처리 등) — 볼드·기호 헤더
        const isHeader =
          /^\*\*.+\*\*$/.test(line) ||
          /^[■▶●]/.test(line) ||
          (line.length <= 14 && /(구매|보관|손질|처리|고르|팁)/.test(line));
        if (isHeader) {
          return (
            <span
              key={i}
              className="mt-2 inline-flex w-fit rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-extrabold text-primary first:mt-0"
            >
              {stripMarks(line.replace(/^[■▶●]\s*/, ""))}
            </span>
          );
        }
        // 일반 문단
        return (
          <p key={i} className="text-jg-ink">
            {stripMarks(line)}
          </p>
        );
      })}
      {typing && (
        <span
          className="inline-block h-4 w-[3px] animate-pulse self-start bg-primary"
          aria-hidden
        />
      )}
    </div>
  );
}

/** 마크다운 볼드(**) 기호 제거(간단). */
function stripMarks(s: string): string {
  return s.replace(/\*\*/g, "").replace(/^#+\s*/, "");
}

function SpeechSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2" aria-busy="true">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-5/6 rounded bg-muted" />
      <div className="mt-2 h-4 w-20 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted" />
    </div>
  );
}

function ErrorInline({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <span className="text-2xl">🥲</span>
      <p className="text-sm font-bold">지금은 안내를 못 드리겠어요</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground"
      >
        다시 시도
      </button>
    </div>
  );
}
