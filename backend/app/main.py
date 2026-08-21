from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, database, dashboard, ai, query, history, saved_queries

app = FastAPI(
    title="Text-to-SQL AI E-commerce Analytics API",
    description="Backend API for natural language to SQL generation, validation and execution over e-commerce db.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(database.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(saved_queries.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "title": "Text-to-SQL AI E-commerce Analytics API",
        "status": "Healthy",
        "documentation": "/docs"
    }
