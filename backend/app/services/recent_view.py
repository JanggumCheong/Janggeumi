from typing import Any

from ..database import get_db
from ..schemas import RecentViewCreate

supabase = get_db()


def _execute_mutation(query):
    response = query.execute()
    if getattr(response, "error", None):
        raise RuntimeError(response.error.message if response.error else "Mutation failed")
    return response.data


def add_recent_view(view: RecentViewCreate) -> Any:
    """Insert a recent view record into Supabase."""
    return _execute_mutation(
        supabase.table("recent_views").insert(view.model_dump())
    )
