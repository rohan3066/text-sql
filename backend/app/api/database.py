from fastapi import APIRouter, Depends, HTTPException, status
from app.services.schema_service import SchemaService
from app.core.dependencies import get_current_user
from app.database.models import User

router = APIRouter(prefix="/database", tags=["Database Metadata"])

@router.get("/health")
def get_db_health(current_user: User = Depends(get_current_user)):
    try:
        latency = SchemaService.get_connection_latency()
        tables = SchemaService.get_table_names()
        return {
            "status": "Connected",
            "database": "ecommerce_db",
            "tables_count": len(tables),
            "connection_latency_ms": latency
        }
    except Exception as e:
        return {
            "status": "Disconnected",
            "database": "ecommerce_db",
            "error": str(e)
        }

@router.get("/schema")
def get_db_schema(current_user: User = Depends(get_current_user)):
    try:
        return SchemaService.get_full_schema()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract database schema: {str(e)}"
        )

@router.get("/tables")
def get_db_tables(current_user: User = Depends(get_current_user)):
    try:
        return SchemaService.get_table_names()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve tables list: {str(e)}"
        )

@router.get("/tables/{table_name}")
def get_db_table_details(table_name: str, current_user: User = Depends(get_current_user)):
    try:
        tables = SchemaService.get_table_names()
        if table_name not in tables:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Table '{table_name}' does not exist in database"
            )
        return SchemaService.get_table_schema(table_name)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get table schema details: {str(e)}"
        )
