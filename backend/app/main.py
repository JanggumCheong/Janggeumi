from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CategoryCreate,
    CategoryFilterCreate,
    FilterOptionCreate,
    FilterSectionCreate,
    IngredientCreate,
    IngredientFilterDetailCreate,
    ProfileCreate,
    RecentViewCreate,
    UserPostCreate,
)
from .services.master_data import (
    create_category_record,
    create_category_filter_record,
    create_filter_option_record,
    create_filter_section_record,
    create_ingredient_filter_detail_record,
    create_ingredient_record,
    create_profile_record,
    create_user_post_record,
)
from .services.query import (
    get_categories as query_get_categories,
    get_category_filters as query_get_category_filters,
    get_ingredients_by_category as query_get_ingredients_by_category,
    get_ingredient_detail as query_get_ingredient_detail,
    get_recent_views_for_user,
)
from .services.recent_view import add_recent_view as add_recent_view_record

app = FastAPI(
    title="Janggeumi API",
    version="0.1.0",
    description="Backend API for the Janggeumi project.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Janggeumi FastAPI backend is running", "status": "ok"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/categories")
def create_category(category: CategoryCreate):
    try:
        data = create_category_record(category)
        return {"message": "Category created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/ingredients")
def create_ingredient(ingredient: IngredientCreate):
    try:
        data = create_ingredient_record(ingredient)
        return {"message": "Ingredient created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/filter-sections")
def create_filter_section(section: FilterSectionCreate):
    try:
        data = create_filter_section_record(section)
        return {"message": "Filter section created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/filter-options")
def create_filter_option(option: FilterOptionCreate):
    try:
        data = create_filter_option_record(option)
        return {"message": "Filter option created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/category-filters")
def create_category_filter(mapping: CategoryFilterCreate):
    try:
        data = create_category_filter_record(mapping)
        return {"message": "Category filter created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/ingredient-filter-details")
def create_ingredient_filter_detail(detail: IngredientFilterDetailCreate):
    try:
        data = create_ingredient_filter_detail_record(detail)
        return {"message": "Ingredient filter detail created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/user-posts")
def create_user_post(post: UserPostCreate):
    try:
        data = create_user_post_record(post)
        return {"message": "User post created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/profiles")
def create_profile(profile: ProfileCreate):
    try:
        data = create_profile_record(profile)
        return {"message": "Profile created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/categories")
def get_categories():
    try:
        return query_get_categories()
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
    try:
        guessed_name = ingredient_id.replace("-", " ")
        return query_get_ingredient_detail(ingredient_id, guessed_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/recent-views")
def add_recent_view(view: RecentViewCreate):
    try:
        data = add_recent_view_record(view)
        return {"message": "Recent view created", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/users/{user_id}/recent-views")
def get_recent_views(user_id: str):
    try:
        return get_recent_views_for_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
