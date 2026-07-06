from typing import Any

from ..database import get_db
from ..schemas import (
    CategoryCreate,
    CategoryFilterCreate,
    FilterGroupCreate,
    FilterOptionCreate,
    IngredientCreate,
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
    return insert_row("ingredients", ingredient.model_dump())


def create_filter_group_record(group: FilterGroupCreate) -> Any:
    """Create a new filter group."""
    return insert_row("filter_groups", group.model_dump())


def create_filter_option_record(option: FilterOptionCreate) -> Any:
    """Create a new filter option."""
    return insert_row("filter_options", option.model_dump())


def create_category_filter_record(mapping: CategoryFilterCreate) -> Any:
    """Create a new category-filter mapping record."""
    return insert_row("category_filters", mapping.model_dump())
