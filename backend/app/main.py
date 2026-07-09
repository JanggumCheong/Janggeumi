import os
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

from .schemas import RecentViewCreate
from .services.query import (
    get_categories as query_get_categories,
    get_category_filters as query_get_category_filters,
    get_home_data as query_get_home_data,
    get_ingredients_by_category as query_get_ingredients_by_category,
    get_ingredient_detail as query_get_ingredient_detail,
    get_recent_views_for_user,
    get_ingredient_storage_data,
    get_ingredient_handling_data,  # query.py에서 정의한 함수 바인딩
)
from .services.recent_view import add_recent_view as add_recent_view_record
from .api.ai import router as ai_router

app = FastAPI(
    title="Janggeumi API",
    version="0.1.0",
    description="Backend API for the Janggeumi project.",
)
app.include_router(ai_router, prefix="/api/ai", tags=["AI Chat"])

app.add_middleware(
    CORSMiddleware,

    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase 클라이언트 전역 초기화 (프로젝트의 글로벌 설정에 맞춰 변수 주입 필요)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Janggeumi FastAPI backend is running", "status": "ok"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/v1/categories")
def get_categories():
    try:
        return query_get_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/home")
def get_home_data(ingredient_id: str = "ing_watermelon"):
    try:
        return query_get_home_data(ingredient_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/categories/{category_id}/filters")
def get_category_filters(category_id: str):
    try:
        return query_get_category_filters(category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/categories/{category_id}/ingredients")
def get_ingredients_by_category(category_id: str, filter_options: Optional[List[str]] = Query(None)):
    try:
        return query_get_ingredients_by_category(category_id, filter_options)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/ingredients/{ingredient_id}")
def get_ingredient_detail(ingredient_id: str):
    """구매탭 관련 메인 가이드"""
    try:
        guessed_name = ingredient_id.replace("-", " ")
        return query_get_ingredient_detail(ingredient_id, guessed_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/users/{user_id}/recent-views")
def get_recent_views(user_id: str):
    try:
        return get_recent_views_for_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/ingredients/{ingredient_id}/storage")
def get_ingredient_storage(ingredient_id: str):
    """보관탭 가이드"""
    try:
        return get_ingredient_storage_data(ingredient_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/ingredients/{ingredient_id}/processing")
def read_ingredient_handling(
    ingredient_id: str, 
    fallback_name: str = Query(None, description="식재료 이름을 찾지 못할 경우 대체할 기본값")
):
    """
    처리탭 가이드: 메인 섹션 정보, 레시피 카테고리 필터, 유저 UGC 리스트 및 배출 방식을 모두 반환합니다.
    URL 오타 처리 및 기존 버전 관리 세션 규칙(/v1/)에 맞춤 조정 완료
    """
    try:
        data = get_ingredient_handling_data(
            supabase_client=supabase, 
            ingredient_id=ingredient_id, 
            fallback_name=fallback_name
        )
        return data
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Bad Request: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)