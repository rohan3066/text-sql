from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_admin_db
from app.database.models import SavedQuery
from app.schemas.saved_query import SavedQueryCreate, SavedQueryResponse
from app.core.dependencies import get_current_user
from app.database.models import User
from typing import List

router = APIRouter(prefix="/saved-queries", tags=["Saved Queries"])

@router.get("", response_model=List[SavedQueryResponse])
def get_saved_queries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    try:
        return db.query(SavedQuery).filter(SavedQuery.user_id == current_user.id).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch saved queries: {str(e)}"
        )

@router.post("", response_model=SavedQueryResponse, status_code=status.HTTP_201_CREATED)
def save_query(
    payload: SavedQueryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    # Check if a saved query with this name already exists for the user
    existing = db.query(SavedQuery).filter(
        SavedQuery.user_id == current_user.id,
        SavedQuery.name == payload.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A saved query with this name already exists."
        )
        
    db_saved = SavedQuery(
        user_id=current_user.id,
        name=payload.name,
        question=payload.question,
        sql=payload.sql
    )
    
    try:
        db.add(db_saved)
        db.commit()
        db.refresh(db_saved)
        return db_saved
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save query: {str(e)}"
        )

@router.get("/{query_id}", response_model=SavedQueryResponse)
def get_saved_query_detail(
    query_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    saved = db.query(SavedQuery).filter(
        SavedQuery.id == query_id,
        SavedQuery.user_id == current_user.id
    ).first()
    
    if not saved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved query not found."
        )
    return saved

@router.delete("/{query_id}")
def delete_saved_query(
    query_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_admin_db)
):
    saved = db.query(SavedQuery).filter(
        SavedQuery.id == query_id,
        SavedQuery.user_id == current_user.id
    ).first()
    
    if not saved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved query not found."
        )
        
    try:
        db.delete(saved)
        db.commit()
        return {"success": True, "message": "Saved query deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete saved query: {str(e)}"
        )
