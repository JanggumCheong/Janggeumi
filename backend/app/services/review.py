from typing import Any

from ..database import get_db
from ..schemas import ReviewCreate

supabase = get_db()


def _execute_mutation(query):
    response = query.execute()
    if getattr(response, "error", None):
        raise RuntimeError(response.error.message if response.error else "Mutation failed")
    return response.data


def create_review(review: ReviewCreate) -> Any:
    """Insert a new review into Supabase."""
    return _execute_mutation(
        supabase.table("reviews").insert(review.model_dump())
    )
