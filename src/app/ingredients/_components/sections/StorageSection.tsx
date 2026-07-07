"use client";

import { useState } from "react";
import type { Storage } from "../../_lib/types";
import type { FilterSelection } from "../../_lib/storage-filter";
import { filterMethods } from "../../_lib/storage-filter";
import { HeroSpeaker } from "../HeroSpeaker";
import { StorageFilters } from "../storage/StorageFilters";
import { MethodList } from "../storage/MethodList";
import { JanggeumiTip } from "../JanggeumiTip";

/**
 * 보관 탭 (합의형) — 내 상황에 맞는 방법 비교. 하위 컴포넌트를 조립.
 *   ✅ HeroSpeaker (세 탭 공통 재사용)
 *   ✅ StorageFilters (3축 드롭다운, 선택 상태 소유)
 *   ⬜ MethodList (선택값으로 필터링된 methods 렌더)
 *   ⬜ JanggeumiTip
 *
 * 필터 선택값(selection)만 이 컨테이너가 들고, 필터링은 순수 함수로.
 * 결과 방법 목록을 MethodList가 받는다.
 */
export function StorageSection({
  slug,
  ingredientName,
  data,
}: {
  slug: string;
  ingredientName: string;
  data: Storage;
}) {
  const [selection, setSelection] = useState<FilterSelection>({});
  const visible = filterMethods(data.methods, selection);

  return (
    <div className="flex flex-col gap-4">
      <HeroSpeaker
        seoTitle={`${ingredientName} 보관법`}
        copy={
          <>
            {ingredientName} 이렇게
            <br />
            보관하는 것이옵니다
          </>
        }
        sub="내 상황에 맞는 방법을 골라보세요"
      />

      {/* setter를 그대로 넘기지 않고, 선택 변경을 다루는 핸들러로 감싼다. */}
      <StorageFilters
        filters={data.filters}
        onChange={(next) => setSelection(next)}
      />

      <MethodList slug={slug} methods={visible} />

      {data.tip && <JanggeumiTip tip={data.tip} />}
    </div>
  );
}
