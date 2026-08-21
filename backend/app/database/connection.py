from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Create engines
# pool_pre_ping is important to automatically reconnect if MySQL connection is dropped
admin_engine = create_engine(
    settings.admin_db_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20
)

readonly_engine = create_engine(
    settings.readonly_db_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20
)

# Session makers
AdminSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=admin_engine)
ReadonlySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=readonly_engine)

Base = declarative_base()

# FastAPI Dependencies
def get_admin_db():
    db = AdminSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_readonly_db():
    db = ReadonlySessionLocal()
    try:
        yield db
    finally:
        db.close()
