from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.query import QueryExecuteRequest, QueryExecuteResponse, QueryValidateRequest, QueryValidateResponse
from app.services.sql_execution_service import SqlExecutionService
from app.services.sql_validation_service import SqlValidationService
from app.database.connection import get_admin_db
from app.database.models import QueryHistory
from app.core.dependencies import get_current_user
from app.database.models import User

router = APIRouter(prefix="/query", tags=["Query Execution"])

@router.post("/validate", response_model=QueryValidateResponse)
def validate_query(
    payload: QueryValidateRequest,
    current_user: User = Depends(get_current_user)
):
    result = SqlValidationService.validate_sql(payload.sql)
    return QueryValidateResponse(
        valid=result["valid"],
        error=result["error"]
    )

@router.post("/execute", response_model=QueryExecuteResponse)
def execute_query(
    payload: QueryExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    # Execute query
    result = SqlExecutionService.execute_query(payload.sql)
    
    # Save to history if natural language question was provided
    if payload.question:
        status_str = "Success" if result["success"] else "Failed"
        history_entry = QueryHistory(
            user_id=current_user.id,
            natural_language_question=payload.question,
            generated_sql=payload.sql,
            explanation=payload.explanation or "",
            execution_status=status_str,
            execution_time=result["execution_time_ms"],
            row_count=result["row_count"]
        )
        try:
            db.add(history_entry)
            db.commit()
        except Exception as e:
            # Don't fail the execution if logging history fails, just roll back and log
            db.rollback()
            # print error
            print(f"Failed to write query history: {str(e)}")
            
    return QueryExecuteResponse(
        success=result["success"],
        columns=result["columns"],
        rows=result["rows"],
        row_count=result["row_count"],
        execution_time_ms=result["execution_time_ms"],
        error=result["error"]
    )
