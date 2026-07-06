/**
 * 장금이의 팁 — 연초록 박스, 💡 + 제목 + 내용. 세 탭 공통 재사용.
 * tip이 있음을 가정한다(필수). 렌더 여부는 호출부가 `tip && <JanggeumiTip tip={tip} />`로 결정.
 */
export function JanggeumiTip({ tip }: { tip: string }) {
  return (
    <div className="flex gap-2.5 rounded-[16px] bg-secondary p-3.5">
      <span className="text-lg leading-none">💡</span>
      <div>
        <div className="text-xs font-bold text-jg-primary-strong">
          장금이의 팁
        </div>
        <p className="mt-0.5 text-xs leading-[1.5] text-jg-ink-sub">{tip}</p>
      </div>
    </div>
  );
}