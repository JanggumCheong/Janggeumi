/**
 * 검색 페이지 하단 안내 박스.
 * 그리드까지 다 훑어본 사용자에게 다음 행동(카테고리 탐색 / 직접 검색)을 알려준다.
 * 장금이 말투(사극체)를 유지한다.
 */
export function SearchGuideBox() {
  return (
    <section className="mt-2 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-8 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-jg-buy-bg text-2xl">🥕</div>

      <h2 className="text-sm font-bold">
        <span aria-hidden="true">👸</span> 무얼 찾으시옵니까?
      </h2>

      <p className="text-xs leading-relaxed text-muted-foreground">
        위 카테고리를 골라 둘러보시옵소서.
        <br />
        재료명을 아신다면 검색이 가장 빠르옵니다.
      </p>
    </section>
  );
}
