"""Storage-related helpers for the current DDL.

The old storage_methods/storage_contents tables were replaced by
ingredient_filter_details rows with tab_type='storage'.
"""

from typing import Any

from ..schemas import IngredientFilterDetailCreate
from .master_data import create_ingredient_filter_detail_record


def create_storage_detail_record(detail: IngredientFilterDetailCreate) -> Any:
    """Create a storage detail row in ingredient_filter_details."""
    return create_ingredient_filter_detail_record(detail)
