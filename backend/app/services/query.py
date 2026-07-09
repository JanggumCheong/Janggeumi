from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import HttpUrl

from ..database import get_db

supabase = get_db()


STORAGE_OPTION_LABEL_OVERRIDES = {
    "fo_whole": "통째로",
    "fo_trimmed": "자른 뒤",
}

HANDLING_OPTION_PRIORITY = {
    "fo_waste_recipe": 0,
    "fo_waste_yes": 1,
}

HANDLING_WASTE_TYPE_BY_OPTION_ID = {
    "fo_waste_recipe": "food",
    "fo_waste_yes": "general",
}


def _storage_option_label(option_id: Optional[str], option_name: Optional[str]) -> Optional[str]:
    return STORAGE_OPTION_LABEL_OVERRIDES.get(option_id) or option_name


def _handling_option_sort_key(option_id: Optional[str]) -> int:
    return HANDLING_OPTION_PRIORITY.get(option_id or "", 99)


def _with_ro_particle(text: str) -> str:
    if not text:
        return text

    last_char = text.strip()[-1]
    code = ord(last_char)
    if not 0xAC00 <= code <= 0xD7A3:
        return f"{text}로"

    has_final_consonant = (code - 0xAC00) % 28 != 0
    return f"{text}{'으로' if has_final_consonant else '로'}"


def _summary_from_text(text: Optional[str], limit: int = 80) -> str:
    if not text:
        return ""

    normalized = " ".join(str(text).split())
    if len(normalized) <= limit:
        return normalized

    return f"{normalized[:limit].rstrip()}..."


def _execute_query(query):
    response = query.execute()
    if getattr(response, "error", None):
        raise RuntimeError(response.error.message if response.error else "Query failed")
    return response.data


def get_categories() -> Any:
    """모든 카테고리를 조회합니다."""
    return _execute_query(supabase.table("categories").select("*").order("name"))


def get_category_filters(category_id: str) -> Any:
    """카테고리에 해당하는 필터 섹션과 옵션들을 조회합니다."""
    return _execute_query(
        supabase.table("category_filters")
        .select(
            "id, sort_order, filter_sections(id, main_tab, section_name, filter_options(id, option_name))"
        )
        .eq("category_id", category_id)
        .order("sort_order")
    )


def get_ingredients_by_category(category_id: str, filter_options: Optional[List[str]] = None) -> Any:
    """카테고리 내 식재료 목록을 조회하며, 옵션 필터링을 지원합니다."""
    query = supabase.table("ingredients").select("*").eq("category_id", category_id)

    if filter_options:
        detail_rows = _execute_query(
            supabase.table("ingredient_filter_details")
            .select("ingredient_id")
            .in_("option_id", filter_options)
        )
        ingredient_ids = sorted(
            {
                row.get("ingredient_id")
                for row in detail_rows
                if row.get("ingredient_id")
            }
        )
        if not ingredient_ids:
            return []
        query = query.in_("id", ingredient_ids)

    return _execute_query(query.order("name"))


def _get_ingredient_row(ingredient_id: str, fallback_name: Optional[str] = None) -> Optional[dict[str, Any]]:
    """식재료 ID, slug 형태의 ID 또는 대체용 이름으로 단건 정보를 조회합니다."""
    select_query = "id, category_id, name, catchphrase, description, image_url, good_case, bad_case, peak_months"

    candidate_ids = [ingredient_id]

    if not ingredient_id.startswith("ing_"):
        candidate_ids.append(f"ing_{ingredient_id.replace('-', '_')}")

    for candidate_id in dict.fromkeys(candidate_ids):
        rows = _execute_query(
            supabase.table("ingredients")
            .select(select_query)
            .eq("id", candidate_id)
            .limit(1)
        )
        if rows:
            return rows[0]

    if fallback_name:
        rows = _execute_query(
            supabase.table("ingredients")
            .select(select_query)
            .eq("name", fallback_name)
            .limit(1)
        )
        if rows:
            return rows[0]

    return None


def _get_category_filter_option_ids(category_id: Optional[str], tab_type: str) -> list[str]:
    """카테고리 필터 섹션에서 허용하는 옵션 ID 리스트를 가져옵니다."""
    if not category_id:
        return []

    category_filters = _execute_query(
        supabase.table("category_filters")
        .select("section_id, sort_order")
        .eq("category_id", category_id)
        .order("sort_order")
    )
    section_ids = [
        row.get("section_id")
        for row in category_filters
        if row.get("section_id")
    ]
    if not section_ids:
        return []

    sections = _execute_query(
        supabase.table("filter_sections")
        .select("id")
        .in_("id", section_ids)
        .eq("main_tab", tab_type)
    )
    tab_section_ids = [row["id"] for row in sections if row.get("id")]
    if not tab_section_ids:
        return []

    options = _execute_query(
        supabase.table("filter_options")
        .select("id")
        .in_("section_id", tab_section_ids)
    )
    return [row["id"] for row in options if row.get("id")]


def get_ingredient_detail(ingredient_id: str, fallback_name: Optional[str] = None) -> Any:
    """
    [구매 탭] 상세 정보 조회
    """
    row = _get_ingredient_row(ingredient_id, fallback_name)
    if not row:
        return None

    purchase_posts = _execute_query(
        supabase.table("ingredient_filter_details")
        .select("id, ingredient_id, option_id, title, description, source, updated_at, rating_value")
        .eq("ingredient_id", row["id"])
        .eq("tab_type", "purchase")
        .order("rating_value")
    )

    return {
        "ingredient": {
            "id": row.get("id"),
            "name": row.get("name"),
            "good_case": row.get("good_case"),
            "bad_case": row.get("bad_case"),
            "catchphrase": row.get("catchphrase"),
            "description": row.get("description"),
            "image_url": row.get("image_url")
        },
        "purchase_tips": [
            {
                "id": post.get("id"),
                "ingredient_id": post.get("ingredient_id"),
                "filter_option_id": post.get("option_id"),
                "title": post.get("title") or "꿀팁",
                "content": post.get("description"),
                "sort_order": post.get("rating_value") or index,
                "sources": [
                    {
                        "source": s.strip(),
                        "updated_at": post.get("updated_at")
                    }
                    for s in (post.get("source").split(",") if post.get("source") else [])
                ]
            }
            for index, post in enumerate(purchase_posts, start=1)
        ],
    }


def get_recent_views_for_user(user_id: str) -> Any:
    """사용자의 최근 본 식재료 목록을 조회합니다."""
    return _execute_query(
        supabase.table("recent_views")
        .select(
            "id, viewed_at, ingredient_id, "
            "ingredients(id, name, catchphrase, description, image_url, peak_months)"
        )
        .eq("user_id", user_id)
        .order("viewed_at", desc=True)
        .limit(10)
    )


def _get_home_data_from_database(ingredient_id: str = "ing_watermelon") -> Dict[str, Any]:
    """메인 홈 화면에 필요한 컴포넌트 데이터를 가져옵니다."""
    try:
        current_month = datetime.now().month

        recommend_row = supabase.table("ingredients") \
            .select("id, name, catchphrase, description, image_url, peak_months") \
            .eq("id", ingredient_id) \
            .single() \
            .execute()
            
        recommend_data = recommend_row.data
        today_recommended = {}
        
        if recommend_data:
            is_season = current_month in (recommend_data.get("peak_months") or [])
            
            today_recommended = {
                "id": recommend_data.get("id"),
                "name": recommend_data.get("name"),
                "emoji": "🍉" if "수박" in recommend_data.get("name", "") else "✨",
                "catchphrase": recommend_data.get("catchphrase"),
                "summary": recommend_data.get("description"),
                "image_url": recommend_data.get("image_url"),
                "is_season": is_season,
                "rating": {
                    "avg": 4.7,    
                    "count": 1248  
                }
            }

        recent_rows = supabase.table("recent_views") \
            .select("viewed_at, ingredients(id, name, image_url)") \
            .order("viewed_at", desc=True) \
            .limit(5) \
            .execute()
            
        recent_views = []
        for row in recent_rows.data:
            ing = row.get("ingredients")
            if ing:
                recent_views.append({
                    "id": ing.get("id"),
                    "name": ing.get("name"),
                    "image_url": ing.get("image_url"),
                    "viewed_at": row.get("viewed_at")
                })

        trending_rows = supabase.table("ingredients") \
            .select("id, name, image_url, peak_months") \
            .filter("peak_months", "cs", f"{{{current_month}}}") \
            .limit(5) \
            .execute()
            
        weekly_trending = []
        for index, row in enumerate(trending_rows.data, start=1):
            weekly_trending.append({
                "rank": index,
                "id": row.get("id"),
                "name": row.get("name"),
                "image_url": row.get("image_url"),
                "trend_status": "지금 제철!"
            })

        return {
            "today_recommended_ingredient": today_recommended,
            "recent_views": recent_views,
            "weekly_trending_ingredients": weekly_trending
        }

    except Exception as e:
        raise Exception(f"Failed to fetch home data: {str(e)}")


# def get_ingredient_storage_data(ingredient_id: str, fallback_name: str = None) -> Dict[str, Any]:
#     """
#     [보관 탭] 가이드 조회
#     - user_posts 테이블에서 실제 보관 팁 데이터를 연동하여 필터 정합성을 완성합니다.
#     """
#     try:
#         ing_query = supabase.table("ingredients") \
#             .select("name") \
#             .eq("id", ingredient_id) \
#             .single() \
#             .execute()
        
#         ing_name = ing_query.data.get("name") if ing_query.data else (fallback_name or "식재료")

#         storage_headline = {
#             "title": f"{ing_name} 보관 방법 비교",
#             "intro": "내 상황에 맞는 방법을 찾아보세요.",
#             "janggeumi_tip": f"{ing_name}은 자른 후 시간이 지날수록 단맛이 떨어질 수 있어요. 최대한 빠르게 드시는 것이 가장 맛있습니다! 💡"
#         }

#         # 1. 필터 레이아웃용 기본 세션 조회
#         sections_query = supabase.table("filter_sections") \
#             .select("id, section_name, filter_options(id, option_name)") \
#             .in_("id", ["fs_cut_status", "fs_storage_location"]) \
#             .execute()

#         storage_filters = []
#         period_options = []

#         for section in sections_query.data:
#             section_id = section.get("id")
#             options_data = section.get("filter_options", [])
            
#             formatted_options = [
#                 {
#                     "option_id": opt.get("id"),
#                     "option_name": opt.get("option_name")
#                 } for opt in options_data
#             ]
            
#             if section_id == "fs_storage_location":
#                 for opt in formatted_options:
#                     opt_id = opt["option_id"]
#                     if opt_id == "fo_room" and {"option_id": "fo_mid_term", "option_name": "중기"} not in period_options:
#                         period_options.append({"option_id": "fo_mid_term", "option_name": "중기"})
#                     elif opt_id == "fo_fridge" and {"option_id": "fo_short_term", "option_name": "단기"} not in period_options:
#                         period_options.append({"option_id": "fo_short_term", "option_name": "단기"})
#                     elif opt_id == "fo_freezer" and {"option_id": "fo_long_term", "option_name": "장기"} not in period_options:
#                         period_options.append({"option_id": "fo_long_term", "option_name": "장기"})

#             storage_filters.append({
#                 "section_id": section_id,
#                 "label": "자름 유무" if section_id == "fs_cut_status" else "보관 장소",
#                 "options": formatted_options
#             })

#         if period_options:
#             order_map = {"fo_short_term": 0, "fo_mid_term": 1, "fo_long_term": 2}
#             period_options.sort(key=lambda x: order_map.get(x["option_id"], 99))
#             storage_filters.insert(1, {
#                 "section_id": "fs_storage_period",
#                 "label": "보관 기간",
#                 "options": period_options
#             })

#         # 🔥 2. 하드코딩 탈피: 유저 포스트 테이블(user_posts)에서 해당 재료의 보관(storage) 데이터 직접 조회
#         posts_query = supabase.table("user_posts") \
#             .select("id, option_id, title, content, rating_value, filter_options(section_id, option_name)") \
#             .eq("ingredient_id", ingredient_id) \
#             .eq("tab_type", "storage") \
#             .execute()

#         methods_map = {}
#         for row in posts_query.data:
#             post_id = row.get("id")
#             title = row.get("title")
#             content = row.get("content")
#             rating_val = row.get("rating_value") or 5
#             opt_data = row.get("filter_options") or {}
            
#             section_id = opt_data.get("section_id")
#             option_id = row.get("option_id")
#             option_name = opt_data.get("option_name")

#             # 보관 위치나 데이터 성격에 매핑되는 보관 기간 라벨 식별
#             if option_id == "fo_room":
#                 period_id, duration_text,option_tezt = "fo_mid_term", "단기","실온"
#             elif option_id == "fo_fridge":
#                 period_id, duration_text,option_tezt = "fo_short_term", "중기","냉장"
#             else:
#                 period_id, duration_text,option_tezt = "fo_long_term", "장기","냉동"

#             if post_id not in methods_map:
#                 methods_map[post_id] = {
#                     "id": post_id,
#                     "title": option_name or title, 
#                     "is_recommended": True if option_id == "fo_room" else False,
                    
#                     # 🔥 user_posts의 option_id에 연동된 태그들을 완벽하게 동적 인젝션
#                     "tags": {
#                         "storage_location_option_id": option_tezt,
#                         "storage_cut_option_id": "fo_whole" if option_id == "fo_room" else "fo_trimmed",
#                         "storage_period_option_id": duration_text
#                     },
#                     "summary": content, # user_posts의 실제 노하우 본문 바인딩
#                     "duration": duration_text, # 동적으로 걸러진 기간 문자열 바인딩
#                     "rating": {
#                         "avg": float(rating_val),
#                         "count": 1248 if option_id == "fo_room" else 982 if option_id == "fo_fridge" else 454
#                     },
#                     "comment": {
#                         "author": { "name": "장금이", "type": "curator" },
#                         "text": content
#                     },
#                     "sources": [
#                         {
#                             "source": "장금이 유저 집단지성 가이드",
#                             "updated_at": datetime.now().isoformat()
#                         }
#                     ]
#                 }
#             else:
#                 if section_id == "fs_cut_status":
#                     methods_map[post_id]["tags"]["storage_cut_option_id"] = option_id
#                 elif section_id == "fs_storage_location":
#                     methods_map[post_id]["tags"]["storage_location_option_id"] = option_id

#         return {
#             "storage_headline": storage_headline,
#             "storage_filters": storage_filters,
#             "storage_methods": list(methods_map.values())
#         }

#     except Exception as e:
#         raise Exception(f"Failed to aggregate database storage data: {str(e)}")

def get_home_data(ingredient_id: str = "ing_watermelon") -> Dict[str, Any]:
    """Return the home screen data."""
    try:
        today_recommended_ingredients = [
            {
                "id": "ing_watermelon",
                "name": "수박",
                "emoji": "🍉",
                "catchphrase": {
                    "highlight": "시원하게 즐기는 여름",
                    "title": "수박"
                },
                "image_url": "public/images/banners/watermelon-recommend-banner.webp",
                "is_season": True,
                "rating": {
                    "avg": 4.7,
                    "count": 1248
                }
            },
            {
                "id": "ing_peach",
                "name": "천도복숭아",
                "emoji": "🍑",
                "catchphrase": {
                    "highlight": "제철 맞은 달콤한",
                    "title": "천도복숭아"
                },
                "image_url": "public/images/banners/peach-recommend-banner.webp",
                "is_season": True,
                "rating": {
                    "avg": 4.5,
                    "count": 986
                }
            }
        ]

        recent_rows = supabase.table("recent_views") \
            .select("viewed_at, ingredients(id, name, image_url)") \
            .order("viewed_at", desc=True) \
            .limit(5) \
            .execute()

        recent_views = []
        for row in recent_rows.data or []:
            ing = row.get("ingredients")
            if ing:
                recent_views.append({
                    "id": ing.get("id"),
                    "name": ing.get("name"),
                    "image_url": ing.get("image_url"),
                    "viewed_at": row.get("viewed_at")
                })

        weekly_trending = [
            {
                "rank": 1,
                "id": "ing_avocado",
                "name": "아보카도",
                "image_url": "https://example.com/images/avocado.png",
                "trend_status": "지금 제철!"
            },
            {
                "rank": 2,
                "id": "ing_peach",
                "name": "천도복숭아",
                "image_url": "public/images/banners/peach-recommend-banner.webp",
                "trend_status": "지금 제철!"
            },
            {
                "rank": 3,
                "id": "ing_watermelon",
                "name": "수박",
                "image_url": "public/images/banners/watermelon-recommend-banner.webp",
                "trend_status": "지금 제철!"
            },
            {
                "rank": 4,
                "id": "ing_korean_melon",
                "name": "참외",
                "image_url": "https://example.com/images/korean-melon.png",
                "trend_status": "지금 제철!"
            },
            {
                "rank": 5,
                "id": "ing_plum",
                "name": "자두",
                "image_url": "https://example.com/images/plum.png",
                "trend_status": "지금 제철!"
            },
            {
                "rank": 6,
                "id": "ing_grape",
                "name": "포도",
                "image_url": "https://example.com/images/grape.png",
                "trend_status": "지금 제철!"
            }
        ]

        return {
            "today_recommended_ingredient": today_recommended_ingredients,
            "today_recommended_ingredients": today_recommended_ingredients,
            "recent_views": recent_views,
            "weekly_trending_ingredients": weekly_trending
        }

    except Exception as e:
        raise Exception(f"Failed to fetch home data: {str(e)}")


def get_ingredient_storage_data(ingredient_id: str, fallback_name: str = None) -> Dict[str, Any]:
    """
    [보관 탭] 가이드 조회
    - user_posts + filter_options 기반 동적 보관 데이터 생성
    """
    try:
        ing_query = supabase.table("ingredients") \
            .select("name") \
            .eq("id", ingredient_id) \
            .single() \
            .execute()

        ing_name = (
            ing_query.data.get("name")
            if ing_query.data
            else (fallback_name or "식재료")
        )

        storage_headline = {
            "title": f"{ing_name} 보관 방법 비교",
            "intro": "내 상황에 맞는 방법을 찾아보세요.",
            "janggeumi_tip": (
                f"{ing_name}은 자른 후 시간이 지날수록 "
                "단맛이 떨어질 수 있어요. 최대한 빠르게 드시는 것이 가장 맛있습니다! 💡"
            )
        }


        # =========================
        # 필터 목록
        # =========================

        sections_query = supabase.table("filter_sections") \
            .select("id, section_name, filter_options(id, option_name)") \
            .in_("id", ["fs_cut_status", "fs_storage_location"]) \
            .execute()


        storage_filters = []
        period_options = []
        option_label_by_id = {}


        for section in sections_query.data:

            section_id = section.get("id")
            options = section.get("filter_options", [])


            formatted_options = [
                {
                    "option_id": opt.get("id"),
                    "option_name": _storage_option_label(
                        opt.get("id"),
                        opt.get("option_name")
                    )
                }
                for opt in options
            ]
            option_label_by_id.update(
                {
                    opt["option_id"]: opt["option_name"]
                    for opt in formatted_options
                    if opt.get("option_id") and opt.get("option_name")
                }
            )


            if section_id == "fs_storage_location":

                for opt in formatted_options:

                    if opt["option_id"] == "fo_room":
                        period_options.append({
                            "option_id": "fo_mid_term",
                            "option_name": "중기"
                        })

                    elif opt["option_id"] == "fo_fridge":
                        period_options.append({
                            "option_id": "fo_short_term",
                            "option_name": "단기"
                        })

                    elif opt["option_id"] == "fo_freezer":
                        period_options.append({
                            "option_id": "fo_long_term",
                            "option_name": "장기"
                        })


            storage_filters.append({
                "section_id": section_id,
                "label": (
                    "자름 유무"
                    if section_id == "fs_cut_status"
                    else "보관 장소"
                ),
                "options": formatted_options
            })


        if period_options:

            order_map = {
                "fo_short_term": 0,
                "fo_mid_term": 1,
                "fo_long_term": 2
            }

            period_options.sort(
                key=lambda x: order_map.get(x["option_id"], 99)
            )


            storage_filters.insert(
                1,
                {
                    "section_id": "fs_storage_period",
                    "label": "보관 기간",
                    "options": period_options
                }
            )


        # =========================
        # 실제 보관 데이터
        # =========================

        # 1. 시스템 기본 필터 상세 정보 가져오기 (화면에 켜두신 테이블)
        details_query = supabase.table("ingredient_filter_details") \
            .select(
                """
                id,
                option_id,
                title,
                description,
                rating_value,
                tab_type,
                filter_options(
                    section_id,
                    option_name
                )
                """
            ) \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "storage") \
            .execute()


        # 2. 유저들이 작성한 포스트 데이터 가져오기
        posts_query = supabase.table("user_posts") \
        .select(
            """
            id,
            option_id,
            title,
            content,
            rating_value,
            filter_options(
                section_id,
                option_name
            )
            """
        ) \
        .eq("ingredient_id", ingredient_id) \
        .eq("tab_type", "storage") \
        .execute()

        # 최종 결과 데이터 활용
        system_details = details_query.data  # 관리자 가이드 데이터
        user_posts = posts_query.data        # 유저들이 쓴 글 목록

        methods_map = {}

        for row in system_details+user_posts:
            post_id = row.get("id")
            option_id = row.get("option_id")
            title = row.get("title")
            content = row.get("content")
            rating_val = row.get("rating_value") or 5
            filter_data = row.get("filter_options") or {}
            section_id = filter_data.get("section_id")
            option_name = filter_data.get("option_name")
            description =  row.get("description")
            title_text = title or option_name or "보관 방법"
            summary_text = description or title or _summary_from_text(content)
            content_text = content or ""

            if post_id not in methods_map:

                methods_map[post_id] = {
                    "id": post_id,
                    "title": title_text,
                    "is_recommended": False,
                    "tags": {
                        "storage_location_option_id": None,
                        "storage_cut_option_id": None,
                        "storage_period_option_id": None
                    },
                    "summary": summary_text,
                    "content": content_text,
                    "duration": None,
                    "rating": {
                        "avg": float(rating_val),
                        "count": 1248
                    },
                    "comment": {
                        "author": {
                            "name": "장금이",
                            "type": "curator"
                        },
                        "text": content_text or summary_text
                    },
                    "sources": [
                        {
                            "source": "장금이 유저 집단지성 가이드",
                            "updated_at": datetime.now().isoformat()
                        }
                    ]
                }
            if section_id == "fs_storage_location":
                cut_option_id = None
                methods_map[post_id]["tags"][
                    "storage_location_option_id"
                ] = _storage_option_label(
                    option_id,
                    option_name
                ) or option_label_by_id.get(option_id)
                if option_id == "fo_room":
                    methods_map[post_id]["duration"] = "중기"
                    methods_map[post_id]["tags"][
                        "storage_period_option_id"
                    ] = "중기"
                    cut_option_id = "fo_whole"
                    methods_map[post_id]["is_recommended"] = True

                elif option_id == "fo_fridge":

                    methods_map[post_id]["duration"] = "단기"

                    methods_map[post_id]["tags"][
                        "storage_period_option_id"
                    ] = "단기"
                    cut_option_id = "fo_trimmed"



                elif option_id == "fo_freezer":

                    methods_map[post_id]["duration"] = "장기"

                    methods_map[post_id]["tags"][
                        "storage_period_option_id"
                    ] = "장기"
                    cut_option_id = "fo_trimmed"

                if cut_option_id:
                    methods_map[post_id]["tags"][
                        "storage_cut_option_id"
                    ] = option_label_by_id.get(cut_option_id) or {
                        "fo_whole": "통째로",
                        "fo_trimmed": "자른 뒤"
                    }.get(cut_option_id)



            elif section_id == "fs_cut_status":

                methods_map[post_id]["tags"][
                    "storage_cut_option_id"
                ] = _storage_option_label(
                    option_id,
                    option_name
                ) or option_label_by_id.get(option_id)

            elif section_id == "fs_storage_period":

                methods_map[post_id]["tags"][
                    "storage_period_option_id"
                ] = _storage_option_label(
                    option_id,
                    option_name
                ) or option_label_by_id.get(option_id)



        return {

            "storage_headline": storage_headline,

            "storage_filters": storage_filters,

            "storage_methods": list(methods_map.values())

        }


    except Exception as e:

        raise Exception(
            f"Failed to aggregate database storage data: {str(e)}"
        )
    
def get_ingredient_handling_data(supabase_client, ingredient_id: str, fallback_name: str = None) -> Dict[str, Any]:
    """
    [처리(레시피/배출) 탭] 가이드 조회
    """
    try:
        ing_query = supabase_client.table("ingredients") \
            .select("name") \
            .eq("id", ingredient_id) \
            .single() \
            .execute()
        
        ing_name = ing_query.data.get("name") if ing_query.data else (fallback_name or "식재료")

        handling_headline = {
            "headline": f"남은 {_with_ro_particle(ing_name)} 무엇이든 지어보세요!",
            "intro": "다양한 레시피와 아이디어 모음"
        }
        
        active_details = supabase_client.table("ingredient_filter_details") \
            .select("option_id") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "processing") \
            .execute()

        posts_query = supabase_client.table("user_posts") \
            .select("id, title, content, rating_value, option_id, filter_options(option_name)") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "processing") \
            .execute()

        active_option_ids = sorted(
            {
                row.get("option_id")
                for row in (active_details.data or []) + (posts_query.data or [])
                if row.get("option_id")
            },
            key=_handling_option_sort_key
        )

        sections_query = supabase_client.table("filter_sections") \
            .select("id, section_name, filter_options(id, option_name)") \
            .eq("main_tab", "처리") \
            .execute()
            
        categories = ["전체"]
        handling_main_sections = []
        handling_option_name_by_id = {}

        for section in sections_query.data:
            section_id = section.get("id")
            
            filtered_options = [
                {
                    "option_id": opt.get("id"),
                    "option_name": opt.get("option_name")
                } 
                for opt in section.get("filter_options", [])
                if opt.get("id") in active_option_ids
            ]
            handling_option_name_by_id.update(
                {
                    opt["option_id"]: opt["option_name"]
                    for opt in filtered_options
                    if opt.get("option_id") and opt.get("option_name")
                }
            )
            
            if filtered_options:
                handling_main_sections.append({
                    "section_id": section_id,
                    "section_name": section.get("section_name"),
                    "options": filtered_options
                })

                for opt in filtered_options:
                    if opt.get("option_name") not in categories:
                        categories.append(opt.get("option_name"))

        recipes = []
        if posts_query.data:
            profiles_query = supabase_client.table("profiles").select("nickname, avatar_url").execute()
            profile_map = {p.get("nickname"): p for p in profiles_query.data} if profiles_query.data else {}

            for post in sorted(
                posts_query.data,
                key=lambda item: _handling_option_sort_key(item.get("option_id"))
            ):
                opt_data = post.get("filter_options") or {}
                title = post.get("title", "")
                option_id = post.get("option_id")
                category = (
                    opt_data.get("option_name")
                    or handling_option_name_by_id.get(option_id)
                    or "레시피"
                )
                
                author_name = "요리하는_지니" if "화채" in title else "자취요리왕"
                matched_profile = profile_map.get(author_name, {})

                recipes.append({
                    "id": post.get("id"),
                    "title": title,
                    "category": category,
                    "desc": post.get("content"),
                    "image": None,
                    "author": {
                        "name": matched_profile.get("nickname", author_name),
                        "type": "ugc",
                        "avatar_url": matched_profile.get("avatar_url")
                    },
                    "reaction": {
                        "likes": 1200 if "화채" in title else 932,
                        "comments": 87 if "화채" in title else 56
                    }
                })

        dispose_query = supabase_client.table("ingredient_filter_details") \
            .select("id, option_id, description, source, updated_at, filter_options(section_id, option_name)") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "processing") \
            .execute()

        dispose_list = []
        for row in sorted(
            dispose_query.data or [],
            key=lambda item: _handling_option_sort_key(item.get("option_id"))
        ):
            opt_id = row.get("option_id")
            opt_data = row.get("filter_options") or {}
            waste_type = HANDLING_WASTE_TYPE_BY_OPTION_ID.get(opt_id, "food")
                
            dispose_list.append({
                "option_id": opt_id,
                "title": (
                    opt_data.get("option_name")
                    or handling_option_name_by_id.get(opt_id)
                    or "배출 안내"
                ),
                "way": row.get("description", ""),
                "wasteType": waste_type,
                "image": None,
                "sources": [
                    {
                        "source": s.strip(),
                        "updated_at": row.get("updated_at")
                    }
                    for s in (row.get("source").split(",") if row.get("source") else [])
                ]
            })

        return {
            "handling_headline": handling_headline,
            "handling_main_sections": handling_main_sections,
            "categories": categories,
            "recipes": recipes,
            "dispose": dispose_list
        }

    except Exception as e:
        raise RuntimeError(f"Database query failed: {str(e)}")
