from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class BlogSeries(Base):
    __tablename__ = "blog_series"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    cover_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    blogs = relationship("Blog", back_populates="series", cascade="all, delete-orphan")

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    series_id = Column(Integer, ForeignKey("blog_series.id"))
    title = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    content = Column(Text)
    excerpt = Column(String, nullable=True)
    cover_image = Column(String, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    series = relationship("BlogSeries", back_populates="blogs")
