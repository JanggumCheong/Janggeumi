"use client";

import { useEffect, useRef } from "react";

/* ── 가로 캐러셀 훅 ──────────────────────────────────────────
   마우스 휠은 세로(deltaY)만 발생하므로, PC에선 스크롤바를 숨긴
   가로 캐러셀에 접근할 방법이 없다. 세로 휠 delta를 가로 스크롤로
   변환해 마우스로도 넘길 수 있게 한다(양 끝에선 페이지 세로 스크롤에 양보). */
export function useHorizontalWheel<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      const atStart = el.scrollLeft <= 0;
      const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;
      e.preventDefault();
      el.scrollLeft += delta;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  return ref;
}
