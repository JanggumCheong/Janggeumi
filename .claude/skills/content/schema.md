# 식재료 콘텐츠 스키마 (API 규약의 뿌리)

> `content` 스킬이 이 스키마를 따라 재료 콘텐츠 JSON을 생성한다.
> 이 스키마는 백엔드·프론트엔드 **API 규약**으로 발전한다. 구조는 고정, 값만 재료별로 가변.

---

## 설계 원칙

1. **공통 뼈대 + 정형 배열.** 모든 재료가 동일한 상위 구조(`purchase`/`storage`/`handling`)를 갖는다. 재료마다 다른 부분(필터 축, 구매 기준)은 **정해진 형태의 배열**(`{key,label,options}`)로 담는다. 프론트는 배열을 렌더링만 하면 되고, 재료별 분기 코드가 필요 없다.
2. **정보 성격에 따라 신뢰 모델이 다르다.** 구매=정답형(출처 필수), 보관=합의형(출처+평점), 처리=확산형(UGC). 같은 스키마를 쓰되 신뢰 필드의 무게가 다르다. → [[design-notes]] 참조.
3. **구매·보관은 검증 필수.** 각 구매 기준·보관법은 `source`(출처)를 반드시 갖는다. 처리는 선택.
4. **"믿는 근거"와 "참고 자료"를 분리한다.** `source`(이 정보를 신뢰하는 근거) ≠ `media`(같이 보면 좋은 영상·이미지). 유튜브는 대개 `media`지만, 공신력 있는 채널이면 `source`도 될 수 있다. 섞으면 검증이 오염된다.
5. **필드는 안정적으로.** 한번 정한 key는 바꾸지 않는다. 새 정보는 새 필드로 추가(하위 호환).

---

## source 객체 (신뢰 근거) — 공통 정의

구매·보관 항목이 "왜 이 정보를 믿는가"를 담는다. **동영상도 출처가 될 수 있으나 신뢰 등급으로 구분한다.**

```jsonc
"source": {
  "org": "농촌진흥청",
  "type": "official",          // official | expert | media | community
  "mediaType": "video",        // article | pdf | video | dataset
  "url": "https://youtube.com/...",
  "verified": true,
  "lastReviewed": "2026-07-01"
}
```

- `type` 신뢰 등급:
  - `official` (농진청·식약처 등 공식) → 구매·보관 출처로 **인정** ✅
  - `expert` (검증된 전문가/기관) → **인정하되 검증 리뷰** △
  - `media` (일반 유튜버·블로그) → 출처로는 **약함**. `source`가 이것뿐이면 검증 리포트에 경고. 참고용은 `media[]`로.
  - `community` (커뮤니티 후기) → 출처 아님. 처리(UGC)에서만.
- `mediaType: "video"`면 `url`은 재생 가능한 링크. 프론트는 임베드/썸네일 처리.
- **구매·보관 규칙:** `source.type`이 `official` 또는 `expert`여야 "검증됨"으로 친다. `media`/`community`만 있으면 `verified:false` 취급.

## media 배열 (참고 자료) — 항목에 선택적으로

신뢰 근거는 아니지만 "같이 보면 좋은" 영상·이미지. 구매 기준·보관법·레시피 어디든 붙을 수 있다.

> **포지셔닝:** 흩어진 유튜브 영상을 재료·방법별로 모아 **검증된 맥락 위에 얹는 것**이 우리 서비스의 핵심 가치다. 영상을 직접 만들지 않고 **큐레이션·정렬**로 "검증(우리 강점) ↔ 실행 영상(유튜브)"의 **중간 허브**가 된다. `media[]`는 이 역할을 담는 필드다. 방법마다 실행 영상 1~3개를 붙이는 것을 권장한다.

```jsonc
"media": [
  { "type": "video", "provider": "youtube", "url": "https://youtube.com/...",
    "title": "수박 실온 보관 꿀팁", "thumbnail": null, "creator": "자취요리왕" }
]
```

---

## 최상위 구조

```jsonc
{
  "id": "watermelon",              // 재료 고유 slug (URL: /재료/watermelon)
  "name": "수박",
  "aliases": ["watermelon"],
  "category": "fruit",             // fruit | vegetable | meat | seafood | dairy | ...
  "emoji": "🍉",
  "summary": "수분 가득! 달콤한 과즙이 일품인 여름 대표 과일",
  "seasonMonths": [6, 7, 8],       // 제철 월 (없으면 [])
  "facts": [                       // 상단 기본 정보 (재료마다 항목 가변, 형태 고정)
    { "key": "category", "label": "분류", "value": "과일" },
    { "key": "calorie",  "label": "칼로리", "value": "31kcal (100g)" },
    { "key": "nutrients","label": "주요 영양 성분", "value": "수분, 비타민C, 라이코펜" }
  ],
  "purchase": { /* 구매 — 정답형 */ },
  "storage":  { /* 보관 — 합의형 */ },
  "handling": { /* 처리 — 확산형 */ },
  "related": [ /* 함께 보면 좋은 콘텐츠 링크 */ ],
  "meta": {
    "schemaVersion": "1.0.0",
    "generatedAt": null,           // 스킬 실행 후 스탬프
    "reviewStatus": "draft"        // draft | reviewed | published
  }
}
```

---

## purchase (구매 · 정답형)

정답이 수렴하는 영역. **출처 기반 검증이 핵심.** 평점은 참고용.

```jsonc
"purchase": {
  "headline": "좋은 수박 고르는 법",
  "intro": "이 6가지만 확인하면 실패 확률이 낮아져요.",
  "bestWorst": {                   // 좋은/피할 예시 대비 (눈으로 학습). 선택.
    "good": { "image": null, "hint": "배꼽 작고, 줄무늬 선명, 묵직한 것" },
    "bad":  { "image": null, "hint": "배꼽 크고, 줄무늬 흐릿, 가벼운 것" }
  },
  "criteria": [                    // 고르는 기준 (재료마다 개수·내용 가변)
    {
      "key": "navel",
      "title": "배꼽(꼭지) 확인",
      "desc": "배꼽이 작고 오목할수록 잘 익은 수박이에요.",
      "image": null,
      "source": {                  // ★ 구매는 출처 필수
        "org": "농촌진흥청",
        "url": "https://...",
        "verified": true,
        "lastReviewed": "2026-07-01"
      }
    }
  ]
}
```

- `bestWorst` — 좋은/피할 예시를 이미지로 대비(초보가 눈으로 학습). `image`는 실제 사진, `hint`는 짧은 대비 포인트. 카피는 재료 무관("이런 걸 고르세요/이건 피하세요")이라 데이터엔 재료명 안 넣음.
- (구 `fieldData` '지금 이 마트 89%' 배지는 확률 게이지 — 기준 체크로 "좋을 확률"을 실시간 계산 — 로 대체되어 제거됨.)

## storage (보관 · 합의형)

정답은 없지만 더 나은 합의는 있다. **출처(전문가 기준선) + 평점(집단지성) 둘 다.**

```jsonc
"storage": {
  "headline": "수박 보관 방법 비교",
  "intro": "내 상황에 맞는 방법을 찾아보세요.",
  "filters": [                     // ★ 재료별 가변 축 — 정형 배열
    { "key": "form",  "label": "상태",      "options": ["통째로", "자른 뒤"] },
    { "key": "place", "label": "보관 장소",  "options": ["실온", "냉장", "냉동"] },
    { "key": "period","label": "보관 기간",  "options": ["단기", "장기"] }
  ],
  "methods": [
    {
      "id": "room-whole",
      "title": "서늘한 실온 보관 (통풍이 잘 되는 곳)",
      "recommended": true,
      "tags": { "form": "통째로", "place": "실온", "period": "단기" },  // filter key로 태깅
      "summary": "직사광선 피해 통풍 잘 되는 서늘한 곳에 두면 당도가 더 올라가요.",
      "durationDays": [7, 10],
      "conditions": { "temp": "15~20℃" },
      "steps": [                   // 따라 하기 (방법 상세용)
        { "no": 1, "title": "직사광선 없는 서늘한 곳 확보", "desc": "...", "image": null }
      ],
      "goodFor": ["통째 수박", "3~4일 내 섭취", "여름철 실온"],
      "notFor": ["이미 자른 수박", "장기 보관(5일+)"],
      "cautions": ["냉장고에 바로 넣지 마세요", "..."],
      "rating": { "avg": 4.6, "count": 1248, "dist": {"5":72,"4":18,"3":7,"2":2,"1":1} },
      "janggeumiComment": "사 온 날은 무조건 이 방법! 냉장 넣기 전 하루는 실온이 당도에 좋아요.",  // 장금이 코멘트 (선택)
      "source": {                  // ★ 보관도 출처 필수 (전문가 기준선)
        "org": "농촌진흥청",
        "url": "https://...",
        "verified": true,
        "lastReviewed": "2026-07-01"
      }
    }
  ],
  "tip": "수박은 자른 후 시간이 지날수록 단맛이 떨어질 수 있어요. 최대한 빠르게 드세요."
}
```

- `janggeumiComment` — **장금이의 검증된 큐레이션 한마디**(선택). 사용자 후기(로그인·UGC)를 대체하는 신뢰 근거. 방법 카드 하단에 "장금이 왈 —"로 조용히 노출(방법 비교가 주인공, 코멘트는 보조 한 줄). 각 방법마다 그 방법 고유의 실용 팁을 담는다. → design-system.md 8-3 K1.
- `tip` — 재료 전체에 대한 장금이의 팁(방법별 아님). 하단 팁 박스.

## handling (처리 · 확산형)

정답 무한. **UGC 중심** — 출처보다 작성자·평점.

처리는 **두 갈래**다 — 사용자의 고민 자체가 다르다:
- **활용 처리(`recipes`)** = 남은 재료를 뭘로 만들까 (레시피·UGC, 확산형).
- **폐기 처리(`dispose`)** = 다 쓰고 어떻게 버릴까 (분리배출 안내, 정답형에 가까움).

화면도 상단 세그먼트로 활용/폐기를 나눈다. 활용은 **정렬만**(카테고리 필터 없음 — 확산형은 피드 탐색). → [[design-notes]], design-system.md 8-4.

> ⚠️ **`categories`·`contribution`은 제거됨.** 기획이 "카테고리 필터 없이 정렬만"으로 확정되며 `categories`(상단 카테고리 배열)와 `contribution`(참여 보상)은 화면에서 빠졌다 → **UI 없는 데이터**라 스키마에서 삭제(구매 `fieldData` 제거와 동일). 레시피 그룹핑은 각 `recipe.category`(개별 필드)로만 표현한다.

```jsonc
"handling": {
  "headline": "남은 수박으로 무엇이든 지어보세요!",
  "intro": "다양한 레시피와 아이디어 모음",

  // ── 활용 처리: 레시피 UGC ──
  "recipes": [
    {
      "id": "watermelon-hwachae",
      "title": "시원한 수박 화채",
      "category": "음료",
      "desc": "남은 수박과 탄산수로 만드는 여름 별미!",
      "image": null,
      "author": { "name": "요리하는_지니", "type": "ugc" },  // ugc | official | curator
      "reaction": { "likes": 1200, "comments": 87 },
      "source": null              // 처리는 출처 선택(없어도 됨)
    }
  ],

  // ── 폐기 처리: 분리배출 안내 (정답형 — 지자체 기준) ──
  //   카드 = 요약(way 한 줄 + wasteType). 상세는 별도 페이지(detailHref)에서 깊게.
  //   상세 필드(steps/cautions/reason/source/detailHref)는 전부 선택 — 출처 확보 전엔 비운다.
  "dispose": [
    {
      "key": "rind",
      "title": "수박 껍질",
      "way": "잘게 잘라 물기를 빼고 배출해요. 흰 속껍질은 무침·장아찌로도 쓸 수 있어요.", // 카드 요약 1줄
      "wasteType": "food",        // food | general | recycle
      "image": null,

      // ↓ 여기부터 상세 페이지용 (모두 선택 — 근거 있는 것만 채운다)
      "reason": "수박 껍질은 수분이 많아 음식물로 분류돼요. 물기를 빼야 처리가 쉬워요.", // 왜 이렇게?
      "steps": [                  // 배출 단계 (보관 steps와 동일 구조)
        { "no": 1, "title": "잘게 자르기", "desc": "부피를 줄여 배출량을 아껴요.", "image": null },
        { "no": 2, "title": "물기 빼기", "desc": "음식물 처리 시설에 부담이 적어요.", "image": null }
      ],
      "cautions": ["스티커가 붙어 있으면 떼고 배출", "너무 큰 덩어리는 잘라서"], // 주의점
      "regionNote": "지자체마다 음식물 분류 기준이 달라요. 애매하면 관할 규정 확인.", // 지역차 안내(정답형 함정)
      "source": {                 // 지자체 기준이라 정답형 — 근거 있으면 붙인다
        "org": "환경부 내 손안의 분리배출", "type": "official",
        "url": "https://...", "verified": true, "lastReviewed": "2026-07-01"
      },
      "detailHref": null          // 상세 페이지 라우트 (없으면 카드 Link는 준비중 #)
    },
    {
      "key": "wrap",
      "title": "포장 랩·스티커",
      "way": "과일에 붙은 스티커와 비닐 랩은 음식물이 아니에요. 일반 쓰레기로.",
      "wasteType": "general",
      "image": null
      // 상세 필드는 근거 확보 후 채운다 (지금은 요약만)
    }
  ]
}
```

- `dispose[]`는 **선택**(없으면 폐기 탭이 "준비 중"). 있으면 각 항목은 `key/title/way/wasteType` **필수**.
- `wasteType`: `food`(음식물) · `general`(일반) · `recycle`(재활용). 지자체 기준이라 **정답형**.
- **카드 = 요약, 상세 = 별도 페이지.** 카드엔 `way`(한 줄) + `wasteType` 배지만. 상세 필드는 **전부 선택**:
  - `reason`(왜 이렇게 버리나) · `steps[]`(배출 단계, 보관 steps와 동일 구조) · `cautions[]`(주의점) · `regionNote`(지자체 차이 안내) · `source`(근거) · `detailHref`(상세 라우트).
  - ⚠️ **분리배출은 지자체·환경부 기준이라 임의로 지어내면 안 된다**(추측 금지 — [[janggeumi-data-from-image-only]]). 상세 필드는 **근거 있는 것만** 채우고, 없으면 비운다(빈 필드는 UI 미노출).
  - "한 줄 `way`만으로 다 이해되지 않는다" — 물기·오분류·지역차 등은 상세에서. 그래서 카드를 **Link로 감싼다**(레시피·방법 카드와 동일). `detailHref` 없으면 준비중 `#`.
- 활용/폐기는 화면에서 세그먼트로 갈리지만, **둘 다 `handling` 안**에 둔다(같은 탭).

## related (함께 보면 좋은 콘텐츠)

```jsonc
"related": [
  { "title": "수박 종류별 특징", "desc": "종류별 맛과 식감 비교", "href": "/...", "image": null }
]
```

---

## 검증 규칙 (스킬이 강제)

- `purchase.criteria[].source` — **필수**. `verified:false`면 검증 리포트에 경고.
- `storage.methods[].source` — **필수**.
- `handling.recipes[].source` — 선택.
- `handling.dispose[]` — 선택. 있으면 `key/title/way/wasteType` 필수, `wasteType`은 `food|general|recycle` 중 하나. 상세 필드(`reason/steps/cautions/regionNote/source/detailHref`)는 선택 — **근거 없으면 비운다**(추측 금지).
- `storage.methods[].tags`의 각 key는 `storage.filters[].key`에 존재해야 함(정합성).
- `rating.dist` 합은 100 근사.
- 모든 `id`/`key`는 영문 slug, 재료 내 유일.
