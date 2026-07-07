from typing import Any

from ..database import get_db
from ..schemas import (
    CategoryCreate,
    CategoryFilterCreate,
    FilterOptionCreate,
    FilterSectionCreate,
    IngredientCreate,
    IngredientFilterDetailCreate,
    ProfileCreate,
    UserPostCreate,
)

supabase = get_db()


def insert_row(table_name: str, payload: dict[str, Any]) -> Any:
    """Insert a payload into the specified Supabase table."""
    response = supabase.table(table_name).insert(payload).execute()
    if getattr(response, "error", None):
        raise RuntimeError(response.error.message if response.error else "Insert failed")
    return response.data


def create_category_record(category: CategoryCreate) -> Any:
    """Create a new category record."""
    return insert_row("categories", category.model_dump())


def create_ingredient_record(ingredient: IngredientCreate) -> Any:
    """Create a new ingredient record."""
    return insert_row("ingredients", ingredient.model_dump(exclude_none=True))


def create_filter_section_record(section: FilterSectionCreate) -> Any:
    """Create a new filter section."""
    return insert_row("filter_sections", section.model_dump())


def create_filter_option_record(option: FilterOptionCreate) -> Any:
    """Create a new filter option."""
    return insert_row("filter_options", option.model_dump(exclude_none=True))


def create_category_filter_record(mapping: CategoryFilterCreate) -> Any:
    """Create a category-to-section mapping record."""
    return insert_row("category_filters", mapping.model_dump(exclude_none=True))


def create_ingredient_filter_detail_record(detail: IngredientFilterDetailCreate) -> Any:
    """Create a new ingredient filter detail record."""
    return insert_row("ingredient_filter_details", detail.model_dump(exclude_none=True))


def create_user_post_record(post: UserPostCreate) -> Any:
    """Create a new user post record."""
    return insert_row("user_posts", post.model_dump(exclude_none=True))


def create_profile_record(profile: ProfileCreate) -> Any:
    """Create a new profile record."""
    return insert_row("profiles", profile.model_dump(exclude_none=True))
