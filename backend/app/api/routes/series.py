from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.blog import BlogSeries
from app.schemas.blog import BlogSeriesCreate, BlogSeriesResponse

router = APIRouter()

@router.get("/", response_model=List[BlogSeriesResponse])
def read_all_series(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    series = db.query(BlogSeries).offset(skip).limit(limit).all()
    return series

@router.get("/{id}", response_model=BlogSeriesResponse)
def read_series(id: int, db: Session = Depends(deps.get_db)):
    series = db.query(BlogSeries).filter(BlogSeries.id == id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    return series

@router.post("/", response_model=BlogSeriesResponse)
def create_series(series: BlogSeriesCreate, db: Session = Depends(deps.get_db)):
    db_series = BlogSeries(**series.dict())
    db.add(db_series)
    db.commit()
    db.refresh(db_series)
    return db_series
