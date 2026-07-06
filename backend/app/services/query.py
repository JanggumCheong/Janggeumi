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


def get_ingredient_detail(ingredient_id: str, fallback_name: Optional[str] = None) -> Any:
    """Fetch ingredient detail with related filter details and user posts."""
    query_str = "*, ingredient_filter_details(*, filter_options(*, filter_sections(*))), user_posts(*)"

    result_rows = _execute_query(
        supabase.table("ingredients")
        .select(query_str)
        .eq("id", ingredient_id)
        .limit(1)
    )

    if not result_rows and fallback_name:
        result_rows = _execute_query(
            supabase.table("ingredients")
            .select(query_str)
            .eq("name", fallback_name)
            .limit(1)
        )

    return result_rows[0] if result_rows else None


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
