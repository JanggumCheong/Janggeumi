from typing import Any

from ..database import get_db
from ..schemas import (
    StorageContentCreate,
    StorageMethodCreate,
    StorageMethodFilterCreate,
)

supabase = get_db()


def insert_row(table_name: str, payload: dict[str, Any]) -> Any:
    """Insert a payload into the specified Supabase table."""
    response = supabase.table(table_name).insert(payload).execute()
    if getattr(response, "error", None):
        raise RuntimeError(response.error.message if response.error else "Insert failed")
    return response.data


def create_storage_method_record(method: StorageMethodCreate) -> Any:
    """Create a new storage method for an ingredient."""
    return insert_row("storage_methods", method.model_dump())


def create_storage_method_filter_record(mapping: StorageMethodFilterCreate) -> Any:
    """Associate a storage method with a filter option."""
    return insert_row("storage_method_filters", mapping.model_dump())


def create_storage_content_record(content: StorageContentCreate) -> Any:
    """Create a storage content step or note."""
    return insert_row("storage_contents", content.model_dump())
