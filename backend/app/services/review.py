"""User post helpers for the current DDL.

The old reviews table was replaced by user_posts.
"""

from typing import Any

from ..schemas import UserPostCreate
from .master_data import create_user_post_record


def create_user_review(post: UserPostCreate) -> Any:
    """Create a user post that can represent a review-style entry."""
    return create_user_post_record(post)
