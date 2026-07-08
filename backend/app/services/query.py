from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import HttpUrl

from ..database import get_db

supabase = get_db()


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
    - sources 필드를 { "source": "...", "updated_at": "..." } 객체 배열로 반환합니다.
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
                # 💡 콤마로 분리된 출처별로 각각 updated_at을 매핑한 JSON 객체 리스트 생성
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


def get_home_data(ingredient_id: str = "ing_watermelon") -> Dict[str, Any]:
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


def get_ingredient_storage_data(ingredient_id: str, fallback_name: str = None) -> Dict[str, Any]:
    """
    [보관 탭] 가이드 조회
    - sources 필드를 { "source": "...", "updated_at": "..." } 객체 배열로 반환합니다.
    """
    try:
        ing_query = supabase.table("ingredients") \
            .select("name") \
            .eq("id", ingredient_id) \
            .single() \
            .execute()
        
        ing_name = ing_query.data.get("name") if ing_query.data else (fallback_name or "식재료")

        storage_headline = {
            "title": f"{ing_name} 보관 방법 비교",
            "intro": "내 상황에 맞는 방법을 찾아보세요.",
            "janggeumi_tip": f"{ing_name}은 자른 후 시간이 지날수록 단맛이 떨어질 수 있어요. 최대한 빠르게 드시는 것이 가장 맛있습니다! 💡"
        }

        sections_query = supabase.table("filter_sections") \
            .select("id, section_name, filter_options(id, option_name)") \
            .in_("id", ["fs_cut_status", "fs_storage_location"]) \
            .execute()

        storage_filters = []
        for section in sections_query.data:
            storage_filters.append({
                "section_id": section.get("id"),
                "label": "자름 유무" if section.get("id") == "fs_cut_status" else "보관 장소",
                "options": [
                    {
                        "option_id": opt.get("id"),
                        "option_name": opt.get("option_name")
                    } for opt in section.get("filter_options", [])
                ]
            })

        details_query = supabase.table("ingredient_filter_details") \
            .select("id, option_id, description, rating_value, source, updated_at, filter_options(section_id, option_name)") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "storage") \
            .execute()

        methods_map = {}
        
        for row in details_query.data:
            detail_id = row.get("id")
            desc = row.get("description", "")
            rating_val = row.get("rating_value") or 5
            opt_data = row.get("filter_options") or {}
            
            section_id = opt_data.get("section_id")
            option_id = row.get("option_id")
            option_name = opt_data.get("option_name")

            if detail_id not in methods_map:
                methods_map[detail_id] = {
                    "id": detail_id,
                    "title": option_name, 
                    "is_recommended": True if option_id == "fo_room" else False,
                    "tags": {},
                    "summary": desc,
                    "duration": "7~10일 보관 가능" if option_id == "fo_room" else "2~3일 보관 가능",
                    "rating": {
                        "avg": float(rating_val),
                        "count": 1248 if option_id == "fo_room" else 982
                    },
                    # 💡 보관 데이터 가이드도 동일한 객체 포맷으로 매핑
                    "sources": [
                        {
                            "source": s.strip(),
                            "updated_at": row.get("updated_at")
                        }
                        for s in (row.get("source").split(",") if row.get("source") else [])
                    ]
                }
            
            if section_id == "fs_cut_status":
                methods_map[detail_id]["tags"]["cut_status_option_id"] = option_id
            elif section_id == "fs_storage_location":
                methods_map[detail_id]["tags"]["storage_location_option_id"] = option_id

        return {
            "storage_headline": storage_headline,
            "storage_filters": storage_filters,
            "storage_methods": list(methods_map.values())
        }

    except Exception as e:
        raise Exception(f"Failed to aggregate database storage data: {str(e)}")


def get_ingredient_handling_data(supabase_client, ingredient_id: str, fallback_name: str = None) -> Dict[str, Any]:
    """
    [처리(레시피/배출) 탭] 가이드 조회
    - sources 필드를 { "source": "...", "updated_at": "..." } 객체 배열로 반환합니다.
    """
    try:
        ing_query = supabase_client.table("ingredients") \
            .select("name") \
            .eq("id", ingredient_id) \
            .single() \
            .execute()
        
        ing_name = ing_query.data.get("name") if ing_query.data else (fallback_name or "식재료")

        handling_headline = {
            "headline": f"남은 {ing_name}으로 무엇이든 지어보세요!",
            "intro": "다양한 레시피와 아이디어 모음"
        }
        
        active_details = supabase_client.table("ingredient_filter_details") \
            .select("option_id") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "processing") \
            .execute()
            
        active_option_ids = [row.get("option_id") for row in active_details.data if row.get("option_id")]

        sections_query = supabase_client.table("filter_sections") \
            .select("id, section_name, filter_options(id, option_name)") \
            .eq("main_tab", "처리") \
            .execute()
            
        categories = ["전체"]
        handling_main_sections = []

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
            
            if filtered_options:
                handling_main_sections.append({
                    "section_id": section_id,
                    "section_name": section.get("section_name"),
                    "options": filtered_options
                })

                for opt in filtered_options:
                    if opt.get("option_name") not in categories:
                        categories.append(opt.get("option_name"))

        posts_query = supabase_client.table("user_posts") \
            .select("id, title, content, rating_value, option_id, filter_options(option_name)") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "processing") \
            .execute()

        recipes = []
        if posts_query.data:
            profiles_query = supabase_client.table("profiles").select("nickname, avatar_url").execute()
            profile_map = {p.get("nickname"): p for p in profiles_query.data} if profiles_query.data else {}

            for post in posts_query.data:
                opt_data = post.get("filter_options") or {}
                title = post.get("title", "")
                
                author_name = "요리하는_지니" if "화채" in title else "자취요리왕"
                matched_profile = profile_map.get(author_name, {})

                recipes.append({
                    "id": post.get("id"),
                    "title": title,
                    "category": opt_data.get("option_name", "레시피"),
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
        for row in dispose_query.data:
            opt_id = row.get("option_id")
            opt_data = row.get("filter_options") or {}
            waste_type = "general" if opt_id == "fo_waste_yes" else "food"
                
            dispose_list.append({
                "option_id": opt_id,
                "title": opt_data.get("option_name", "배출 안내"),
                "way": row.get("description", ""),
                "wasteType": waste_type,
                "image": None,
                # 💡 배출 안내 데이터의 sources도 객체 배열 형태로 포맷 매핑
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