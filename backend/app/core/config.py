import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    APP_ENV: str = "development"
    
    # Gemini Configuration
    GEMINI_API_KEY: str = ""
    
    # MySQL Database Configuration
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str = "ecommerce_db"
    
    # Read-Only account (For safe AI query execution)
    MYSQL_USER: str = "textsql_reader"
    MYSQL_PASSWORD: str = "readerpassword"
    
    # Write account (For auth, history, saved queries, dashboard metadata)
    MYSQL_ADMIN_USER: str = "textsql_admin"
    MYSQL_ADMIN_PASSWORD: str = "adminpassword"
    MYSQL_ROOT_PASSWORD: str = "rootpassword"
    
    # Security Configuration
    JWT_SECRET_KEY: str = "supersecretkey1234567890987654321"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:80,http://localhost"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def readonly_db_url(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"

    @property
    def admin_db_url(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_ADMIN_USER}:{self.MYSQL_ADMIN_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
