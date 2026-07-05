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
  ],
  "fieldData": {                   // '지금 이 마트' 실시간 데이터 (선택)
    "enabled": true,
    "label": "이 마트 수박 평균 당도 예측",
    "value": 89, "unit": "%",
    "basis": "최근 2주간 사용자 평가 기반",
    "sampleSize": 2341
  }
}
```

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

## handling (처리 · 확산형)

정답 무한. **UGC 중심** — 출처보다 작성자·평점.

```jsonc
"handling": {
  "headline": "남은 수박으로 무엇이든 지어보세요!",
  "intro": "다양한 레시피와 아이디어 모음",
  "categories": ["전체", "음료", "디저트", "요리", "김치/절임"],
  "recipes": [
    {
      "id": "watermelon-hwachae",
      "title": "시원한 수박 화채",
      "category": "음료",
      "desc": "남은 수박과 탄산수로 만드는 여름 별미!",
      "image": null,
      "author": { "name": "요리하는_지니", "type": "ugc" },  // ugc | official
      "reaction": { "likes": 1200, "comments": 87 },
      "source": null              // 처리는 출처 선택(없어도 됨)
    }
  ],
  "contribution": { "enabled": true, "reward": "가챠권" }
}
```

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
- `storage.methods[].tags`의 각 key는 `storage.filters[].key`에 존재해야 함(정합성).
- `rating.dist` 합은 100 근사.
- 모든 `id`/`key`는 영문 slug, 재료 내 유일.
