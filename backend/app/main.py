from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Portfolio API")

# CORS setup
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create database tables
from app.core.database import engine, Base
from app.models import blog # Import models to register them
Base.metadata.create_all(bind=engine)

# Include routers
from app.api.routes import blogs, series
app.include_router(blogs.router, prefix="/api/blogs", tags=["blogs"])
app.include_router(series.router, prefix="/api/series", tags=["series"])

# Mount static files for uploads
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Portfolio API"}
