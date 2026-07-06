from typing import Any, List, Optional

from ..database import get_db

supabase = get_db()


def _execute_query(query):
    response = query.execute()
    if getattr(response, "error", None):
        raise RuntimeError(response.error.message if response.error else "Query failed")
    return response.data


def get_categories() -> Any:
    """Fetch all categories."""
    return _execute_query(supabase.table("categories").select("*").order("name"))


def get_category_filters(category_id: str) -> Any:
    """Fetch filter sections and their options for a category."""
    return _execute_query(
        supabase.table("category_filters")
        .select(
            "id, sort_order, filter_sections(id, main_tab, section_name, filter_options(id, option_name))"
        )
        .eq("category_id", category_id)
        .order("sort_order")
    )


def get_ingredients_by_category(category_id: str, filter_options: Optional[List[str]] = None) -> Any:
    """Fetch ingredients in a category, optionally filtered by detail option IDs."""
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
    """Fetch one ingredient by id, slug-like id, or fallback name."""
    select_query = "id, category_id, name, catchphrase, description, image_url"
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
    """Fetch option IDs allowed by the category's filter sections for a tab."""
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


# def get_ingredient_detail(ingredient_id: str, fallback_name: Optional[str] = None) -> Any:
#     """Fetch ingredient detail shaped for the frontend detail page."""
#     row = _get_ingredient_row(ingredient_id, fallback_name)
#     if not row:
#         return None

#     option_ids = _get_category_filter_option_ids(row.get("category_id"), "purchase")
#     purchase_posts = []

#     if option_ids:
#         purchase_posts = _execute_query(
#             supabase.table("user_posts")
#             .select("id, ingredient_id, option_id, title, content, created_at")
#             .eq("ingredient_id", row["id"])
#             .eq("tab_type", "purchase")
#             .in_("option_id", option_ids)
#             .order("created_at")
#         )

#     return {
#         "ingredient": {
#             "id": row.get("id"),
#             "name": row.get("name"),
#             "catchphrase": row.get("catchphrase"),
#             "description": row.get("description"),
#             "image_url": row.get("image_url"),
#         },
#         "purchase_tips": [
#             {
#                 "id": post.get("id"),
#                 "ingredient_id": post.get("ingredient_id"),
#                 "filter_option_id": post.get("option_id"),
#                 "title": post.get("title"),
#                 "content": post.get("content"),
#                 "sort_order": index,
#             }
#             for index, post in enumerate(purchase_posts, start=1)
#         ],
#     }

def get_ingredient_detail(ingredient_id: str, fallback_name: Optional[str] = None) -> Any:
    """Fetch ingredient detail shaped for the frontend detail page."""
    row = _get_ingredient_row(ingredient_id, fallback_name)
    if not row:
        return None

    # 1. 테이블명을 ingredient_filter_details로 변경하고 존재하는 컬럼들만 select 합니다.
    purchase_posts = _execute_query(
        supabase.table("ingredient_filter_details")
        .select("id, ingredient_id, option_id, description, created_at")
        .eq("ingredient_id", row["id"])
        .eq("tab_type", "purchase")
        .order("created_at")
    )

    return {
        "ingredient": {
            "id": row.get("id"),
            "name": row.get("name"),
            "catchphrase": row.get("catchphrase"),
            "description": row.get("description"),
            "image_url": row.get("image_url"),
        },
        "purchase_tips": [
            {
                "id": post.get("id"),
                "ingredient_id": post.get("ingredient_id"),
                "filter_option_id": post.get("option_id"),
                # 💡 만약 DB의 description에 "배꼽 확인하기\n수박 아래쪽의..." 형태로 
                # 제목과 내용이 함께 들어있다면 아래처럼 split하여 나누어 줄 수 있습니다.
                "title": post.get("description", "").split("\n")[0] if "\n" in post.get("description", "") else "꿀팁",
                "content": post.get("description", "").split("\n", 1)[1] if "\n" in post.get("description", "") else post.get("description"),
                "sort_order": index,
            }
            for index, post in enumerate(purchase_posts, start=1)
        ],
    }

# def get_home_data(ingredient_id: str = "ing_watermelon") -> Any:
#     """Fetch the home page payload for the selected featured ingredient."""
#     fallback_name = ingredient_id.replace("-", " ")
#     return get_ingredient_detail(ingredient_id, fallback_name)

# from datetime import datetime
# from typing import Any, Dict

# def get_home_data(ingredient_id: str = "ing_watermelon") -> Dict[str, Any]:
#     """메인 홈 화면에 필요한 추천 식재료, 최근 본 식재료, 주간 트렌딩 데이터를 한 번에 반환합니다."""
#     try:
#         # 1. 오늘의 추천 식재료 상세 조회
#         recommend_row = supabase.table("ingredients") \
#             .select("id, name, catchphrase, description, image_url, peak_months") \
#             .eq("id", ingredient_id) \
#             .single() \
#             .execute()
            
#         recommend_data = recommend_row.data
#         today_recommended = {}
        
#         if recommend_data:
#             # 현재 달(Month) 기준으로 제철(is_season) 여부 판별
#             current_month = datetime.now().month
#             is_season = current_month in (recommend_data.get("peak_months") or [])
            
#             today_recommended = {
#                 "id": recommend_data.get("id"),
#                 "name": recommend_data.get("name"),
#                 "emoji": "🍉" if "수박" in recommend_data.get("name", "") else "✨", # 이름 기반 임시 이모지
#                 "catchphrase": recommend_data.get("catchphrase"),
#                 "summary": recommend_data.get("description"),
#                 "image_url": recommend_data.get("image_url"),
#                 "is_season": is_season,
#                 "rating": {
#                     "avg": 4.7,    # 💡 추후 user_posts 등에서 평점 평균 연산 가능
#                     "count": 1248  # 💡 추후 user_posts 등에서 리뷰 개수 카운트 가능
#                 }
#             }

#         # 2. 최근 본 식재료 목록 조회 (최대 5개)
#         # 테이블 관계 조인을 사용해 recent_views와 ingredients를 한 번에 묶어옵니다.
#         recent_rows = supabase.table("recent_views") \
#             .select("viewed_at, ingredients(id, name, image_url)") \
#             .order("viewed_at", desc=True) \
#             .limit(5) \
#             .execute()
            
#         recent_views = []
#         for row in recent_rows.data:
#             ing = row.get("ingredients")
#             if ing:
#                 recent_views.append({
#                     "id": ing.get("id"),
#                     "name": ing.get("name"),
#                     "image_url": ing.get("image_url"),
#                     "viewed_at": row.get("viewed_at")
#                 })

#         # 3. 주간 트렌딩 식재료 조회 (상위 5개)
#         trending_rows = supabase.table("ingredients") \
#             .select("id, name, image_url") \
#             .limit(5) \
#             .execute()
            
#         weekly_trending = []
#         status_pool = ["인기 급상승", "지금 제철!"]
        
#         for index, row in enumerate(trending_rows.data, start=1):
#             weekly_trending.append({
#                 "rank": index,
#                 "id": row.get("id"),
#                 "name": row.get("name"),
#                 "image_url": row.get("image_url"),
#                 "trend_status": status_pool[index % 2]  # 홀짝으로 번갈아가며 임시 매핑
#             })

#         # 4. 프론트엔드가 요구한 최종 JSON 구조로 리턴
#         return {
#             "today_recommended_ingredient": today_recommended,
#             "recent_views": recent_views,
#             "weekly_trending_ingredients": weekly_trending
#         }

#     except Exception as e:
#         raise Exception(f"Failed to fetch home data: {str(e)}")
    
def get_recent_views_for_user(user_id: str) -> Any:
    """Fetch recent ingredient views for a user."""
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


from datetime import datetime
from typing import Any, Dict

def get_home_data(ingredient_id: str = "ing_watermelon") -> Dict[str, Any]:
    """메인 홈 화면에 필요한 추천 식재료, 최근 본 식재료, 주간 트렌딩 데이터를 한 번에 반환합니다."""
    try:
        # 1. 현재 시스템의 '이번 달'을 숫자로 구함 (예: 7월이면 7)
        current_month = datetime.now().month

        # 2. 오늘의 추천 식재료 상세 조회
        recommend_row = supabase.table("ingredients") \
            .select("id, name, catchphrase, description, image_url, peak_months") \
            .eq("id", ingredient_id) \
            .single() \
            .execute()
            
        recommend_data = recommend_row.data
        today_recommended = {}
        
        if recommend_data:
            # integer[] 배열 안에 현재 월이 들어있는지 체크
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

        # 3. 최근 본 식재료 목록 조회 (최대 5개)
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

        # 4. 주간 트렌딩 식재료 조회 (오류 해결용 포스트그레스큐엘 오버랩 Filter 문법 적용)
        # peak_months 배열에 이번 달이 포함된 행을 안전하게 필터링합니다.
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

        # 5. 최종 JSON 구조 반환
        return {
            "today_recommended_ingredient": today_recommended,
            "recent_views": recent_views,
            "weekly_trending_ingredients": weekly_trending
        }

    except Exception as e:
        raise Exception(f"Failed to fetch home data: {str(e)}")
    

    from typing import Any, Dict

from typing import Dict, Any, List

def get_ingredient_storage_data(ingredient_id: str, fallback_name: str = None) -> Dict[str, Any]:
    """
    Supabase의 filter_sections, filter_options, ingredient_filter_details 테이블을
    정확히 쿼리하여 실제 매핑된 데이터 구조를 가공하여 반환합니다.
    """
    try:
        # 1. 식재료 정보 가져오기 (마스터 데이터)
        ing_query = supabase.table("ingredients") \
            .select("name") \
            .eq("id", ingredient_id) \
            .single() \
            .execute()
        
        ing_name = ing_query.data.get("name") if ing_query.data else (fallback_name or "식재료")

        # 2. 보관 메인 헤드라인 가공
        storage_headline = {
            "title": f"{ing_name} 보관 방법 비교",
            "intro": "내 상황에 맞는 방법을 찾아보세요.",
            "janggeumi_tip": f"{ing_name}은 자른 후 시간이 지날수록 단맛이 떨어질 수 있어요. 최대한 빠르게 드시는 것이 가장 맛있습니다! 💡"
        }

        # 3. DB 기준의 보관 탭 필터 목록 가져오기 (fs_cut_status, fs_storage_location)
        # 보관(storage) 및 공통에 쓰이는 섹션과 옵션들을 실제 DB에서 정제하여 빌드합니다.
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

        # 4. 상세 보관 가이드 정보 가져오기 (tab_type = 'storage')
        # option_id와 매핑 관계가 들어있는 details 테이블 데이터를 가져옵니다.
        details_query = supabase.table("ingredient_filter_details") \
            .select("id, option_id, description, rating_value, filter_options(section_id, option_name)") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "storage") \
            .execute()

        # DB에 저장된 각 가이드들이 어떤 옵션 조합(태그)을 가졌는지 묶어내기 위한 그룹화 작업
        # 동일한 설명(description)이나 아이디 기준으로 유연하게 가공이 가능합니다.
        methods_map = {}
        
        for row in details_query.data:
            detail_id = row.get("id")
            desc = row.get("description", "")
            rating_val = row.get("rating_value") or 5
            opt_data = row.get("filter_options") or {}
            
            section_id = opt_data.get("section_id")
            option_id = row.get("option_id")
            option_name = opt_data.get("option_name")

            # 보관법 마스터 키 정의 (설명문 기준 혹은 고유 ID 매핑에 따라 그룹화 가능)
            # 여기서는 하나의 데이터 세트로 정렬합니다.
            if detail_id not in methods_map:
                methods_map[detail_id] = {
                    "id": detail_id,
                    "title": option_name, # DB의 매핑된 옵션 명을 가이드의 대표 타이틀로 지정
                    "is_recommended": True if option_id == "fo_room" else False, # DB id 매칭 조건식 분기
                    "tags": {},
                    "summary": desc,
                    "duration": "7~10일 보관 가능" if option_id == "fo_room" else "2~3일 보관 가능",
                    "rating": {
                        "avg": float(rating_val),
                        "count": 1248 if option_id == "fo_room" else 982
                    }
                }
            
            # DB의 section_id에 맞춰 tags 정보에 매핑 데이터를 주입합니다 (fs_cut_status, fs_storage_location)
            if section_id == "fs_cut_status":
                methods_map[detail_id]["tags"]["cut_status_option_id"] = option_id
            elif section_id == "fs_storage_location":
                methods_map[detail_id]["tags"]["storage_location_option_id"] = option_id

        # 5. 최종 결과 패킹 및 리턴
        return {
            "storage_headline": storage_headline,
            "storage_filters": storage_filters,
            "storage_methods": list(methods_map.values())
        }

    except Exception as e:
        raise Exception(f"Failed to aggregate database storage data: {str(e)}")
    
from typing import Dict, Any

def get_ingredient_handling_data(supabase_client, ingredient_id: str, fallback_name: str = None) -> Dict[str, Any]:
    """
    해당 식재료가 ingredient_filter_details에 실제로 가지고 있는 'processing' 옵션들만 파싱하여
    불필요한 타 카테고리(육류, 수산물) 섹션을 완전히 제외하고 화면을 구성합니다.
    """
    try:
        # 1. 식재료 기본 정보 조회
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
        
        # 2. 이 식재료가 실제 'processing' 탭에서 사용하는 연관 옵션들만 조회 (fo_waste_recipe, fo_waste_yes 등)
        active_details = supabase_client.table("ingredient_filter_details") \
            .select("option_id") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "processing") \
            .execute()
            
        active_option_ids = [row.get("option_id") for row in active_details.data if row.get("option_id")]

        # 3. '처리' 탭에 속하는 섹션들 중 실제 연관된 옵션이 있는 것만 빌드
        sections_query = supabase_client.table("filter_sections") \
            .select("id, section_name, filter_options(id, option_name)") \
            .eq("main_tab", "처리") \
            .execute()
            
        categories = ["전체"]
        handling_main_sections = []

        for section in sections_query.data:
            section_id = section.get("id")
            
            # 현재 식재료가 가진 옵션들만 걸러내기
            filtered_options = [
                {
                    "option_id": opt.get("id"),
                    "option_name": opt.get("option_name")
                } 
                for opt in section.get("filter_options", [])
                if opt.get("id") in active_option_ids
            ]
            
            # 매핑된 옵션이 있는 섹션만 유효화 (수산물, 육류 섹션 자동 제거됨)
            if filtered_options:
                handling_main_sections.append({
                    "section_id": section_id,
                    "section_name": section.get("section_name"),
                    "options": filtered_options
                })

                # 상단 필터 칩 카테고리는 실제 매핑된 옵션명들로만 동적 구성
                for opt in filtered_options:
                    if opt.get("option_name") not in categories:
                        categories.append(opt.get("option_name"))

        # 4. 유저 포스트(UGC 레시피) 리스트 조회 및 수동 매핑
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
                
                # 작성자 수동 조인 (에러 회피)
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

        # 5. 쓰레기 분리배출 가이드 상세 매핑
        dispose_query = supabase_client.table("ingredient_filter_details") \
            .select("id, option_id, description, filter_options(section_id, option_name)") \
            .eq("ingredient_id", ingredient_id) \
            .eq("tab_type", "processing") \
            .execute()

        dispose_list = []
        for row in dispose_query.data:
            opt_id = row.get("option_id")
            opt_data = row.get("filter_options") or {}
            
            # 쓰레기 분류 여부 자동 바인딩
            waste_type = "general" if opt_id == "fo_waste_yes" else "food"
                
            dispose_list.append({
                "option_id": opt_id,
                "title": opt_data.get("option_name", "배출 안내"),
                "way": row.get("description", ""),
                "wasteType": waste_type,
                "image": None
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