from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BlogSeriesBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None

class BlogBase(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    order: int = 0

class BlogSeriesCreate(BlogSeriesBase):
    pass

class BlogCreate(BlogBase):
    series_id: int

class BlogUpdate(BlogBase):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None

class BlogResponse(BlogBase):
    id: int
    series_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BlogSeriesResponse(BlogSeriesBase):
    id: int
    created_at: datetime
    blogs: List[BlogResponse] = []

    class Config:
        from_attributes = True
