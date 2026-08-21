import time
import logging
from sqlalchemy import text
from app.database.connection import readonly_engine
from app.services.sql_validation_service import SqlValidationService

logger = logging.getLogger(__name__)

class SqlExecutionService:
    MAX_ROWS = 1000
    TIMEOUT_MS = 5000 # 5 seconds

    @classmethod
    def execute_query(cls, sql: str) -> dict:
        """
        Validates and executes SQL query on the read-only connection.
        Returns result in structured dictionary format.
        """
        # 1. Validate SQL safety
        validation = SqlValidationService.validate_sql(sql)
        if not validation["valid"]:
            return {
                "success": False,
                "error": validation["error"],
                "columns": [],
                "rows": [],
                "row_count": 0,
                "execution_time_ms": 0
            }

        start_time = time.time()
        
        try:
            with readonly_engine.connect() as conn:
                # 2. Apply session timeout for MySQL
                conn.execute(text(f"SET SESSION max_execution_time = {cls.TIMEOUT_MS}"))
                
                # 3. Execute query
                result = conn.execute(text(sql))
                
                # 4. Fetch columns
                # result.keys() returns a list of keys (columns)
                columns = list(result.keys())
                
                # 5. Fetch rows (limit to MAX_ROWS)
                rows_raw = result.fetchmany(cls.MAX_ROWS)
                
                rows = []
                for row in rows_raw:
                    # Convert row tuple into a key-value dictionary
                    row_dict = {}
                    for col_name, value in zip(columns, row):
                        # Convert date/datetime objects to string format for JSON serialization
                        if hasattr(value, "isoformat"):
                            row_dict[col_name] = value.isoformat()
                        elif hasattr(value, "to_eng_format"): # Decimal compatibility
                            row_dict[col_name] = float(value)
                        elif isinstance(value, bytes):
                            row_dict[col_name] = value.decode("utf-8", errors="ignore")
                        else:
                            row_dict[col_name] = value
                    rows.append(row_dict)
                    
                execution_time_ms = round((time.time() - start_time) * 1000, 2)
                
                return {
                    "success": True,
                    "columns": columns,
                    "rows": rows,
                    "row_count": len(rows),
                    "execution_time_ms": execution_time_ms,
                    "error": None
                }
                
        except Exception as e:
            execution_time_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(f"SQL execution failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "columns": [],
                "rows": [],
                "row_count": 0,
                "execution_time_ms": execution_time_ms
            }
