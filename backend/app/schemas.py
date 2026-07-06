from typing import List, Literal, Optional
from pydantic import BaseModel

TabType = Literal["purchase", "storage", "processing"]


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


class ProfileCreate(BaseModel):
    """Request body schema for creating a profile."""
    id: str
    nickname: str
    avatar_url: Optional[str] = None


class FilterSectionCreate(BaseModel):
    id: str
    main_tab: str
    section_name: str


class FilterOptionCreate(BaseModel):
    id: str
    section_id: Optional[str] = None
    option_name: str


class CategoryFilterCreate(BaseModel):
    id: Optional[str] = None
    category_id: Optional[str] = None
    section_id: Optional[str] = None
    sort_order: Optional[int] = 1


class IngredientFilterDetailCreate(BaseModel):
    id: Optional[str] = None
    ingredient_id: Optional[str] = None
    option_id: Optional[str] = None
    description: str
    rating_value: Optional[int] = None
    tab_type: TabType = "purchase"


class UserPostCreate(BaseModel):
    id: Optional[str] = None
    ingredient_id: Optional[str] = None
    option_id: Optional[str] = None
    tab_type: TabType
    title: str
    content: str
    rating_value: Optional[int] = None
