"use client";

import { useState } from "react";
import type { Purchase } from "../../_lib/types";
import { HeroSpeaker } from "../HeroSpeaker";
import { BestWorst } from "../purchase/BestWorst";
import { ProbabilityGauge } from "../purchase/ProbabilityGauge";
import { CriteriaChecklist } from "../purchase/CriteriaChecklist";
import { SourceSummary } from "../purchase/SourceSummary";

/**
 * 구매 탭 (정답형) — 좋은 재료 고르는 법. 하위 컴포넌트를 조립.
 *   ✅ HeroSpeaker
 *   ✅ ProbabilityGauge(순수 표시) — sticky, 체크 수 받아 확률 표시
 *   ✅ BestWorst(좋은/피할 대비)
 *   ✅ CriteriaChecklist(criteria+체크 상태 소유) → 체크 수를 게이지에 전달
 *   ⬜ SourceSummary
 *
 * 체크 수(checkedCount)만 이 컨테이너가 들고, 게이지↔체크리스트를 잇는다.
 * criteria·체크 상태는 체크리스트가 소유(응집), 게이지는 숫자만 받는다.
 */
export function PurchaseSection({
  ingredientName,
  data,
}: {
  ingredientName: string;
  data: Purchase;
}) {
  const [checkedCount, setCheckedCount] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <HeroSpeaker
        seoTitle={data.headline}
        copy={
          <>
            좋은 {ingredientName}
            <br />
            이렇게 고르는 것이옵니다
          </>
        }
        sub="기준을 하나씩 확인하면 확률이 올라가요"
      />
      {/* 게이지: 숫자만 (sticky, 체크리스트보다 위) */}
      <ProbabilityGauge
        label={`이 ${ingredientName}이 좋은 ${ingredientName}일 확률`}
        checked={checkedCount}
        total={data.criteria.length}
      />

      {/* 좋은/피할 대비 (데이터 있을 때만). 이미지는 API good_case/bad_case. */}
      {data.bestWorst && <BestWorst data={data.bestWorst} />}

      {/* 체크리스트: criteria+체크 상태 소유. 체크 수만 위로 알림. */}
      <CriteriaChecklist criteria={data.criteria} onCheckedChange={setCheckedCount} />

      {/* 출처 요약 (신뢰 = SEO·GEO). criteria의 source를 집계. */}
      <SourceSummary criteria={data.criteria} />
    </div>
  );
}
