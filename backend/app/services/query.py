from typing import Any, List, Optional
from ..database import get_db

supabase = get_db()


def _execute_query(query):
    response = query.execute()
    if getattr(response, "error", None):
        raise RuntimeError(response.error.message if response.error else "Query failed")
    return response.data


# 1. 카테고리 목록 전체 조회
def get_categories() -> Any:
    """Fetch all categories."""
    return _execute_query(supabase.table("categories").select("*"))


# 2. 특정 카테고리가 사용하는 필터 옵션 목록 조회
def get_category_filters(category_id: str) -> Any:
    """Fetch filter options for a specific category."""
    return _execute_query(
        supabase.table("category_filters")
        .select("sort_order, filter_options(id, filter_group_id, option_name)")
        .eq("category_id", category_id)
        .order("sort_order")
    )


# 3. 특정 카테고리의 식재료 목록 조회 (다중 필터 적용 가능)
def get_ingredients_by_category(category_id: str, filter_options: Optional[List[str]] = None) -> Any:
    """Fetch ingredients in a category, optionally filtered by selected filter option IDs."""
    if filter_options:
        filter_res = _execute_query(
            supabase.table("storage_method_filters")
            .select("storage_method_id")
            .in_("filter_option_id", filter_options)
        )

        method_ids = [item["storage_method_id"] for item in filter_res]
        if not method_ids:
            return []

        method_res = _execute_query(
            supabase.table("storage_methods")
            .select("ingredient_id")
            .in_("id", method_ids)
        )

        ingredient_ids = [item["ingredient_id"] for item in method_res]
        if not ingredient_ids:
            return []

        return _execute_query(
            supabase.table("ingredients")
            .select("*")
            .eq("category_id", category_id)
            .in_("id", ingredient_ids)
        )

    return _execute_query(
        supabase.table("ingredients")
        .select("*")
        .eq("category_id", category_id)
    )

# app/services/query.py 내부 임시 수정
def get_ingredient_detail(ingredient_id: str, fallback_name: Optional[str] = None) -> Any:
    try:
        # 우선 안전하게 기존 보관 정보만 가져옵니다.
        result = _execute_query(
            supabase.table("ingredients")
            .select("*, storage_methods(*, storage_contents(*))")
            .eq("id", ingredient_id)
            .single()
        )
        
        if not result and fallback_name:
            result = _execute_query(
                supabase.table("ingredients")
                .select("*, storage_methods(*, storage_contents(*))")
                .eq("name", fallback_name)
                .single()
            )
            
        # 테이블이 없는 상태이므로 프론트엔드가 터지지 않게 빈 배열을 강제로 넣어줍니다.
        if result:
            result["purchase_tips"] = []
            result["recipes"] = []
            
        return result
    except Exception as e:
        print(f"Query Error: {e}")
        return None

# # 4. 식재료 상세 일괄 조회 (🔥 기획안의 구매, 보관, 처리 데이터 완전 바인딩)
# def get_ingredient_detail(ingredient_id: str, fallback_name: Optional[str] = None) -> Any:
#     """Fetch ingredient detail with 3 distinct feature tabs data:
#     1. Purchase (via purchase_tips)
#     2. Storage (via storage_methods & storage_contents)
#     3. Disposal/Processing (via recipes)
#     """
#     # 기획서 상의 구매 가이드(purchase_tips), 보관법, 처리 레시피(recipes)를 전부 조인하여 가져옵니다.
#     query_str = "*, purchase_tips(*), storage_methods(*, storage_contents(*)), recipes(*)"
    
#     result = _execute_query(
#         supabase.table("ingredients")
#         .select(query_str)
#         .eq("id", ingredient_id)
#         .single()
#     )

#     if not result and fallback_name:
#         result = _execute_query(
#             supabase.table("ingredients")
#             .select(query_str)
#             .eq("name", fallback_name)
#             .single()
#         )

#     return result


# 6. 특정 보관법에 대한 리뷰 목록 조회 (최신순)
def get_reviews_for_storage_method(storage_method_id: str) -> Any:
    """Fetch reviews for a storage method."""
    return _execute_query(
        supabase.table("reviews")
        .select("*")
        .eq("storage_method_id", storage_method_id)
        .order("created_at", desc=True)
    )


# 8. 유저별 최근 본 식재료 목록 조회 (최신순 10개 제한)
def get_recent_views_for_user(user_id: str) -> Any:
    """Fetch recent ingredient views for a user."""
    return _execute_query(
        supabase.table("recent_views")
        .select("id, viewed_at, ingredients(*)")
        .eq("user_id", user_id)
        .order("viewed_at", desc=True)
        .limit(10)
    )


# --- 홈 화면 데이터 바인딩용 유틸 및 메인 함수 ---

def _get_ingredient_card_data(item: dict[str, Any], badge: str | None = None) -> dict[str, Any]:
    """Supabase 조인 결과 row에서 프론트엔드 카드 컴포넌트용 공통 구조를 안전하게 추출합니다."""
    ingredient = item.get("ingredients") or {}
    return {
        "id": ingredient.get("id") or item.get("ingredient_id"),
        "name": ingredient.get("name") or "이름 없는 식재료",
        "image_url": ingredient.get("image_url") or "",
        "badge": badge,
    }


def get_home_data() -> Any:
    """Fetch home page payload using actual Supabase queries."""
    # 추천 식재료: 추천 보관법 중 평점 높은 항목을 사용
    recommended_rows = _execute_query(
        supabase.table("storage_methods")
        .select("ingredient_id, cached_rating, cached_review_cnt, is_recommended, ingredients(id, name, description, image_url, peak_months)")
        .eq("is_recommended", True)
        .order("cached_rating", desc=True)
        .limit(1)
    )

    recommended = None
    if recommended_rows:
        item = recommended_rows[0]
        ingredient = item.get("ingredients") or {}
        recommended = {
            "id": ingredient.get("id") or item.get("ingredient_id"),
            "name": ingredient.get("name") or "추천 식재료",
            "badge": "추천",
            "rating": float(item.get("cached_rating", 0)) if item.get("cached_rating") is not None else 0,
            "review_count": int(item.get("cached_review_cnt", 0)) if item.get("cached_review_cnt") is not None else 0,
            "description": ingredient.get("description") or "",
            "image_url": ingredient.get("image_url") or "",
        }

    # 추천 항목이 없는 경우 대피(Fallback) 로직
    if not recommended:
        fallback_rows = _execute_query(
            supabase.table("storage_methods")
            .select("ingredient_id, cached_rating, cached_review_cnt, ingredients(id, name, description, image_url)")
            .order("cached_rating", desc=True)
            .limit(1)
        )
        if fallback_rows:
            item = fallback_rows[0]
            ingredient = item.get("ingredients") or {}
            recommended = {
                "id": ingredient.get("id") or item.get("ingredient_id"),
                "name": ingredient.get("name") or "추천 식재료",
                "badge": "추천",
                "rating": float(item.get("cached_rating", 0)) if item.get("cached_rating") is not None else 0,
                "review_count": int(item.get("cached_review_cnt", 0)) if item.get("cached_review_cnt") is not None else 0,
                "description": ingredient.get("description") or "",
                "image_url": ingredient.get("image_url") or "",
            }

    # 최근 본 식재료 조회 (최대 3개 추출)
    recent_rows = _execute_query(
        supabase.table("recent_views")
        .select("ingredient_id, ingredients(id, name, image_url, peak_months)")
        .order("viewed_at", desc=True)
        .limit(20)
    )

    recent_ingredients = []
    seen_recent = set()
    for row in recent_rows:
        ingredient = row.get("ingredients") or {}
        ingredient_id = ingredient.get("id") or row.get("ingredient_id")
        
        if not ingredient_id or ingredient_id in seen_recent:
            continue
            
        seen_recent.add(ingredient_id)
        recent_ingredients.append(_get_ingredient_card_data(row, badge=None))
        
        if len(recent_ingredients) >= 3:
            break

    # 인기 있는 식재료 조회 (최대 3개 추출)
    trending_rows = _execute_query(
        supabase.table("storage_methods")
        .select("ingredient_id, cached_review_cnt, ingredients(id, name, image_url)")
        .order("cached_review_cnt", desc=True)
        .limit(20)
    )

    trending_ingredients = []
    seen_trending = set()
    for row in trending_rows:
        ingredient = row.get("ingredients") or {}
        ingredient_id = ingredient.get("id") or row.get("ingredient_id")
        
        if not ingredient_id or ingredient_id in seen_trending:
            continue
            
        seen_trending.add(ingredient_id)
        trending_ingredients.append(_get_ingredient_card_data(row, badge="인기 급상승"))
        
        if len(trending_ingredients) >= 3:
            break

    return {
        "recommended_ingredient": recommended or {},
        "recent_ingredients": recent_ingredients,
        "trending_ingredients": trending_ingredients,
    }