from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AiSqlGenerateRequest(BaseModel):
    question: str
    history: Optional[List[Dict[str, str]]] = None # list of {"role": "user"|"assistant", "content": "..."}

class VisualizationInfo(BaseModel):
    type: str # "bar"|"line"|"pie"|"area"|"table"
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None

class AiSqlGenerateResponse(BaseModel):
    success: bool
    sql: Optional[str] = None
    explanation: Optional[str] = None
    visualization: Optional[VisualizationInfo] = None
    error: Optional[str] = None

class AiSqlExplainRequest(BaseModel):
    sql: str

class AiSqlExplainResponse(BaseModel):
    explanation: str

class AiSqlCorrectRequest(BaseModel):
    original_sql: str
    error_message: str
    question: str

class AiSqlOptimizeRequest(BaseModel):
    sql: str

class AiSqlOptimizeResponse(BaseModel):
    suggestions: List[str]
    estimated_complexity: str
    potential_indexes: List[str]
