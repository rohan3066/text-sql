from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class QueryExecuteRequest(BaseModel):
    sql: str
    question: Optional[str] = None # optional natural language question to track in history
    explanation: Optional[str] = None # optional AI explanation to track in history

class QueryExecuteResponse(BaseModel):
    success: bool
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    error: Optional[str] = None

class QueryValidateRequest(BaseModel):
    sql: str

class QueryValidateResponse(BaseModel):
    valid: bool
    error: Optional[str] = None
