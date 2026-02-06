# Portfolio Website

A modern portfolio website with a blog system, built with **React** (frontend) and **FastAPI** (backend).

## ✨ Features

- 🏠 **Home** - Hero section with introduction
- 💼 **Work** - Project showcase gallery
- 📝 **Blogs** - Markdown-powered blog with series support
- ⚙️ **Admin** - Built-in panel to manage blog content
- 🌙 **Dark Theme** - Sleek, modern UI design
- 🔄 **Future-Ready** - 2D/3D toggle placeholder for Three.js integration

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, React Router |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Markdown | marked.js, highlight.js |
| Styling | CSS Variables, CSS Modules |

## 📁 Project Structure

```
Portfolio/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API integration
│   │   └── utils/       # Markdown parser
│   └── package.json
│
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── api/routes/  # API endpoints
│   │   ├── models/      # Database models
│   │   └── schemas/     # Pydantic schemas
│   ├── uploads/         # Blog images
│   └── requirements.txt
│
└── docs/              # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API runs at: `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs at: `http://localhost:5173`

## 📖 Usage

### Managing Blogs
1. Navigate to `/admin` in the browser
2. Create a new **Blog Series** (e.g., "Python Tutorials")
3. Add **Blog Posts** with Markdown content
4. View published blogs at `/blogs`

### Adding Images to Blogs
1. Upload images to `backend/uploads/blogs/{blog-slug}/`
2. Reference in markdown: `![Alt Text](/api/uploads/blogs/{slug}/image.png)`

## 🔗 API Documentation
FastAPI provides automatic API docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📄 License
MIT License - Feel free to use for your own portfolio!
