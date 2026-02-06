from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid
from app.api import deps
from app.models.blog import Blog
from app.schemas.blog import BlogCreate, BlogUpdate, BlogResponse

router = APIRouter()

@router.get("/", response_model=List[BlogResponse])
def read_blogs(
    skip: int = 0,
    limit: int = 100,
    series_id: Optional[int] = None,
    db: Session = Depends(deps.get_db)
):
    query = db.query(Blog)
    if series_id:
        query = query.filter(Blog.series_id == series_id)
    return query.order_by(Blog.order).offset(skip).limit(limit).all()

@router.get("/{slug}", response_model=BlogResponse)
def read_blog(slug: str, db: Session = Depends(deps.get_db)):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.post("/", response_model=BlogResponse)
def create_blog(blog: BlogCreate, db: Session = Depends(deps.get_db)):
    db_blog = Blog(**blog.dict())
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.put("/{id}", response_model=BlogResponse)
def update_blog(id: int, blog: BlogUpdate, db: Session = Depends(deps.get_db)):
    db_blog = db.query(Blog).filter(Blog.id == id).first()
    if not db_blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    update_data = blog.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_blog, key, value)
    
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.delete("/{id}")
def delete_blog(id: int, db: Session = Depends(deps.get_db)):
    db_blog = db.query(Blog).filter(Blog.id == id).first()
    if not db_blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    db.delete(db_blog)
    db.commit()
    return {"ok": True}

@router.post("/{slug}/images")
async def upload_blog_image(
    slug: str,
    file: UploadFile = File(...),
):
    # Base uploads directory
    base_upload_dir = os.path.join(os.getcwd(), "uploads", "blogs", slug)
    os.makedirs(base_upload_dir, exist_ok=True)
    
    # Generate unique filename to prevent overwrite
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(base_upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return path relative to API mount
    return {"url": f"/api/uploads/blogs/{slug}/{unique_filename}"}
