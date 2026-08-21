from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.ai import (
    AiSqlGenerateRequest, AiSqlGenerateResponse,
    AiSqlExplainRequest, AiSqlExplainResponse,
    AiSqlCorrectRequest, AiSqlOptimizeRequest, AiSqlOptimizeResponse
)
from app.services.gemini_service import GeminiService, GeminiServiceMock
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.database.models import User

router = APIRouter(prefix="/ai", tags=["AI Engine"])

def get_gemini_service():
    if not settings.GEMINI_API_KEY:
        # Fall back to mock if no API key is specified (helps pass local builds/tests easily)
        return GeminiServiceMock
    return GeminiService

@router.post("/generate-sql", response_model=AiSqlGenerateResponse)
def generate_sql(
    payload: AiSqlGenerateRequest,
    current_user: User = Depends(get_current_user),
    ai_service=Depends(get_gemini_service)
):
    try:
        result = ai_service.generate_sql(payload.question, payload.history)
        if "error" in result:
            return AiSqlGenerateResponse(
                success=False,
                error=result["error"]
            )
            
        return AiSqlGenerateResponse(
            success=True,
            sql=result.get("sql"),
            explanation=result.get("explanation"),
            visualization=result.get("visualization")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )

@router.post("/explain-sql", response_model=AiSqlExplainResponse)
def explain_sql(
    payload: AiSqlExplainRequest,
    current_user: User = Depends(get_current_user),
    ai_service=Depends(get_gemini_service)
):
    try:
        explanation = ai_service.explain_sql(payload.sql)
        return AiSqlExplainResponse(explanation=explanation)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI explanation failed: {str(e)}"
        )

@router.post("/correct-sql", response_model=AiSqlGenerateResponse)
def correct_sql(
    payload: AiSqlCorrectRequest,
    current_user: User = Depends(get_current_user),
    ai_service=Depends(get_gemini_service)
):
    try:
        result = ai_service.correct_sql(payload.original_sql, payload.error_message, payload.question)
        if "error" in result:
            return AiSqlGenerateResponse(
                success=False,
                error=result["error"]
            )
        return AiSqlGenerateResponse(
            success=True,
            sql=result.get("sql"),
            explanation=result.get("explanation"),
            visualization=result.get("visualization")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI SQL correction failed: {str(e)}"
        )

@router.post("/optimize-sql", response_model=AiSqlOptimizeResponse)
def optimize_sql(
    payload: AiSqlOptimizeRequest,
    current_user: User = Depends(get_current_user),
    ai_service=Depends(get_gemini_service)
):
    try:
        result = ai_service.optimize_sql(payload.sql)
        return AiSqlOptimizeResponse(
            suggestions=result.get("suggestions", []),
            estimated_complexity=result.get("estimated_complexity", "Medium"),
            potential_indexes=result.get("potential_indexes", [])
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI SQL optimization failed: {str(e)}"
        )
