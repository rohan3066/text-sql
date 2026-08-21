from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session
from app.database.connection import get_admin_db
from app.database.models import QueryHistory
from app.core.dependencies import get_current_user
from app.database.models import User

router = APIRouter(prefix="/history", tags=["Query History"])

@router.get("")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    try:
        # Get history of queries for the current user, ordered by creation date descending
        history_list = db.query(QueryHistory).filter(
            QueryHistory.user_id == current_user.id
        ).order_by(desc(QueryHistory.created_at)).all()
        
        results = []
        for h in history_list:
            results.append({
                "id": h.id,
                "natural_language_question": h.natural_language_question,
                "generated_sql": h.generated_sql,
                "explanation": h.explanation,
                "execution_status": h.execution_status,
                "execution_time": h.execution_time,
                "row_count": h.row_count,
                "created_at": h.created_at.isoformat() if h.created_at else None
            })
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch query history: {str(e)}"
        )

@router.get("/{history_id}")
def get_history_detail(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    h = db.query(QueryHistory).filter(
        QueryHistory.id == history_id,
        QueryHistory.user_id == current_user.id
    ).first()
    
    if not h:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query history item not found."
        )
        
    return {
        "id": h.id,
        "natural_language_question": h.natural_language_question,
        "generated_sql": h.generated_sql,
        "explanation": h.explanation,
        "execution_status": h.execution_status,
        "execution_time": h.execution_time,
        "row_count": h.row_count,
        "created_at": h.created_at.isoformat() if h.created_at else None
    }

@router.delete("/{history_id}")
def delete_history_item(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    h = db.query(QueryHistory).filter(
        QueryHistory.id == history_id,
        QueryHistory.user_id == current_user.id
    ).first()
    
    if not h:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query history item not found."
        )
        
    try:
        db.delete(h)
        db.commit()
        return {"success": True, "message": "Query history item deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete history item: {str(e)}"
        )

@router.delete("")
def clear_all_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    try:
        db.query(QueryHistory).filter(QueryHistory.user_id == current_user.id).delete()
        db.commit()
        return {"success": True, "message": "All query history cleared successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )
