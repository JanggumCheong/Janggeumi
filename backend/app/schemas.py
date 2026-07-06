from typing import List, Optional
from pydantic import BaseModel


class ReviewCreate(BaseModel):
    """Request body schema for creating a review."""
    storage_method_id: str
    user_id: str
    nickname: str
    rating: int
    content: str
    image_url: Optional[str] = None


class RecentViewCreate(BaseModel):
    """Request body schema for storing a user's recently viewed ingredient."""
    user_id: str
    ingredient_id: str


class CategoryCreate(BaseModel):
    """Request body schema for creating a category."""
    id: str
    name: str


class IngredientCreate(BaseModel):
    id: str
    category_id: Optional[str] = None
    name: str
    catchphrase: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    peak_months: Optional[List[str]] = None


class FilterGroupCreate(BaseModel):
    id: str
    name: str


class FilterOptionCreate(BaseModel):
    id: str
    filter_group_id: Optional[str] = None
    option_name: str


class CategoryFilterCreate(BaseModel):
    """Request body schema for connecting a category and a filter option."""
    category_id: str
    filter_option_id: str
    sort_order: Optional[int] = 1


class StorageMethodCreate(BaseModel):
    """Request body schema for a storage method on an ingredient."""
    id: str
    ingredient_id: Optional[str] = None
    title: str
    duration_text: Optional[str] = None
    is_recommended: Optional[bool] = False


class StorageMethodFilterCreate(BaseModel):
    """Request body schema for associating a storage method with a filter option."""
    storage_method_id: str
    filter_option_id: str


class StorageContentCreate(BaseModel):
    """Request body schema for adding storage content steps or notes."""
    storage_method_id: Optional[str] = None
    content_type: str
    sort_order: int
    text_content: str
