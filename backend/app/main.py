from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CategoryCreate,
    CategoryFilterCreate,
    FilterGroupCreate,
    FilterOptionCreate,
    IngredientCreate,
    RecentViewCreate,
    ReviewCreate,
    StorageContentCreate,
    StorageMethodCreate,
    StorageMethodFilterCreate,
)
from .services.storage import (
    create_storage_content_record,
    create_storage_method_filter_record,
    create_storage_method_record,
)
from .services.master_data import (
    create_category_record,
    create_category_filter_record,
    create_filter_group_record,
    create_filter_option_record,
    create_ingredient_record,
)
from .services.query import (
    get_categories as query_get_categories,
    get_category_filters as query_get_category_filters,
    get_ingredients_by_category as query_get_ingredients_by_category,
    get_ingredient_detail as query_get_ingredient_detail,
    get_home_data as query_get_home_data,
    get_reviews_for_storage_method,
    get_recent_views_for_user,
)
from .services.review import create_review as create_review_record
from .services.recent_view import add_recent_view as add_recent_view_record

app = FastAPI(
    title="Janggeumi API",
    version="0.1.0",
    description="Backend API for the Janggeumi project.",
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 시스템 기본 엔드포인트 ---

@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Janggeumi FastAPI backend is running", "status": "ok"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


# --- [마스터 데이터 생성 API] 버전 관리 적용 (/v1) ---

@app.post("/v1/categories")
def create_category(category: CategoryCreate):
    """Create a category record in the Supabase categories table."""
    try:
        data = create_category_record(category)
        return {"message": "Category created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/ingredients")
def create_ingredient(ingredient: IngredientCreate):
    """Create an ingredient record in the Supabase ingredients table."""
    try:
        data = create_ingredient_record(ingredient)
        return {"message": "Ingredient created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/filter-groups")
def create_filter_group(group: FilterGroupCreate):
    """Create a filter group record in Supabase."""
    try:
        data = create_filter_group_record(group)
        return {"message": "Filter group created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/filter-options")
def create_filter_option(option: FilterOptionCreate):
    """Create a filter option record in Supabase."""
    try:
        data = create_filter_option_record(option)
        return {"message": "Filter option created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/category-filters")
def create_category_filter(mapping: CategoryFilterCreate):
    """Create a category-filter mapping record."""
    try:
        data = create_category_filter_record(mapping)
        return {"message": "Category filter created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/storage-methods")
def create_storage_method(method: StorageMethodCreate):
    """Create a storage method record for an ingredient."""
    try:
        data = create_storage_method_record(method)
        return {"message": "Storage method created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/storage-method-filters")
def create_storage_method_filter(mapping: StorageMethodFilterCreate):
    """Associate a storage method with a filter option."""
    try:
        data = create_storage_method_filter_record(mapping)
        return {"message": "Storage method filter created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/storage-contents")
def create_storage_content(content: StorageContentCreate):
    """Create a content row for a storage method (STEP/GOOD/BAD/CAUTION)."""
    try:
        data = create_storage_content_record(content)
        return {"message": "Storage content created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- [장금이 서비스 핵심 API] 버전 관리 적용 (/v1) ---

# 0. 홈 화면 데이터 일괄 조회
@app.get("/v1/home")
def get_home_data() -> dict:
    """Return the home page payload structure for the Next.js frontend."""
    try:
        return query_get_home_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 1. 카테고리 목록 전체 조회
@app.get("/v1/categories")
def get_categories():
    try:
        return query_get_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2. 특정 카테고리가 사용하는 필터 옵션 목록 조회
@app.get("/v1/categories/{category_id}/filters")
def get_category_filters(category_id: str):
    try:
        return query_get_category_filters(category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 3. 특정 카테고리의 식재료 목록 조회 (다중 필터 적용 가능)
@app.get("/v1/categories/{category_id}/ingredients")
def get_ingredients_by_category(category_id: str, filter_options: Optional[List[str]] = Query(None)):
    try:
        return query_get_ingredients_by_category(category_id, filter_options)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 4. 식재료 상세 & 세부 보관 방법(storage_contents) 일괄 조회
@app.get("/v1/ingredients/{ingredient_id}")
def get_ingredient_detail(ingredient_id: str):
    try:
        # Allow lookup by ingredient id or ingredient name to make slug-based pages work.
        guessed_name = ingredient_id.replace("-", " ")
        return query_get_ingredient_detail(ingredient_id, guessed_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 5. 리뷰 작성
@app.post("/v1/reviews")
def create_review(review: ReviewCreate):
    try:
        data = create_review_record(review)
        return {"message": "리뷰가 성공적으로 등록되었습니다.", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 6. 특정 보관법에 대한 리뷰 목록 조회 (최신순)
@app.get("/v1/storage-methods/{storage_method_id}/reviews")
def get_reviews(storage_method_id: str):
    try:
        return get_reviews_for_storage_method(storage_method_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 7. 유저별 최근 본 식재료 추가
@app.post("/v1/recent-views")
def add_recent_view(view: RecentViewCreate):
    try:
        data = add_recent_view_record(view)
        return {"message": "최근 본 식재료가 기록되었습니다.", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 8. 유저별 최근 본 식재료 목록 조회 (최신순 10개 제한)
@app.get("/v1/users/{user_id}/recent-views")
def get_recent_views(user_id: str):
    try:
        return get_recent_views_for_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))