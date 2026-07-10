"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 타자기 효과 — 완성된 텍스트를 한 글자씩 점진 노출한다.
 * ai/chat은 스트리밍(SSE)을 주지 않고 완성 answer를 한 번에 준다 →
 * "AI가 실시간으로 써 내려가는" 느낌을 프론트에서 흉내 낸다.
 *
 * enabled가 true가 되는 순간부터 타이핑 시작. 반환값(shown)은 지금까지 노출된 부분 문자열.
 * done은 전부 노출됐는지. speed=한 틱에 노출할 글자 수(기본 2), interval=틱 간격(ms).
 */
export function useTypewriter(
  full: string | undefined,
  enabled: boolean,
  { speed = 2, interval = 16 }: { speed?: number; interval?: number } = {},
) {
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 텍스트가 없거나 아직 시작 전이면 리셋
    if (!full || !enabled) {
      setCount(0);
      return;
    }

    setCount(0);
    timerRef.current = setInterval(() => {
      setCount((c) => {
        const next = c + speed;
        if (next >= full.length && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return full.length;
        }
        return next;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [full, enabled, speed, interval]);

  const shown = full ? full.slice(0, count) : "";
  const done = !full || count >= full.length;
  return { shown, done };
}
