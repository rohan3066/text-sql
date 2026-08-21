import logging
import sqlglot
from sqlglot import exp
from app.services.schema_service import SchemaService

logger = logging.getLogger(__name__)

class SqlValidationService:
    @staticmethod
    def validate_sql(sql: str) -> dict:
        """
        Parses and validates SQL for safety.
        Returns:
            dict: {"valid": bool, "error": str | None}
        """
        if not sql or not sql.strip():
            return {"valid": False, "error": "SQL statement is empty."}
            
        try:
            # 1. Parse using sqlglot
            # sqlglot.parse returns a list of parsed expressions.
            parsed_statements = list(sqlglot.parse(sql, read="mysql"))
            
            # 2. Reject multiple statements
            if len(parsed_statements) > 1:
                return {
                    "valid": False, 
                    "error": "Multiple SQL statements are not allowed. Only a single SELECT statement is permitted."
                }
                
            if len(parsed_statements) == 0:
                return {"valid": False, "error": "Failed to parse SQL statement."}
                
            expression = parsed_statements[0]
            
            # 3. Ensure it is a SELECT statement
            # The root expression node must be a Select (or Union, which is safe and acts like a Select)
            if not isinstance(expression, (exp.Select, exp.Union)):
                return {
                    "valid": False,
                    "error": f"Only SELECT statements are allowed. Detected statement type: {type(expression).__name__.upper()}"
                }
                
            # 4. Check for dangerous nodes anywhere in the syntax tree
            # Even within subqueries, check that we don't have update/insert/delete/ddl
            forbidden_types = tuple(
                t for t in (
                    getattr(exp, "Insert", None), getattr(exp, "Update", None), 
                    getattr(exp, "Delete", None), getattr(exp, "Drop", None), 
                    getattr(exp, "AlterTable", None), getattr(exp, "Alter", None), 
                    getattr(exp, "AlterColumn", None), getattr(exp, "Create", None), 
                    getattr(exp, "Truncate", None), getattr(exp, "Command", None)
                ) if t is not None
            )
            for node in expression.walk():
                if isinstance(node, forbidden_types):
                    return {
                        "valid": False,
                        "error": f"Dangerous operation detected: {type(node).__name__.upper()} is strictly forbidden."
                    }
            
            # 5. Check if table names referenced are valid in our database
            # This prevents accessing information_schema, mysql.user, etc.
            allowed_tables = {table_name.lower() for table_name in SchemaService.get_table_names()}
            referenced_tables = [table.name.lower() for table in expression.find_all(exp.Table)]
            
            for table in referenced_tables:
                # We can bypass table validation for derived subquery tables or CTEs
                # (which won't be in SchemaService, but in sqlglot they might still appear as tables)
                # But to keep it simple, we check if the table name is NOT in allowed_tables AND NOT in CTE names.
                ctes = {cte.alias.lower() for cte in expression.find_all(exp.CTE)}
                
                if table not in allowed_tables and table not in ctes:
                    return {
                        "valid": False,
                        "error": f"Access denied or table does not exist: Table '{table}' is not in the e-commerce schema."
                    }
                    
            return {"valid": True, "error": None}
            
        except sqlglot.errors.ParseError as pe:
            logger.error(f"SQLGlot parse error: {str(pe)}")
            return {
                "valid": False,
                "error": f"SQL Syntax Error: Failed to parse SQL statement. {str(pe)}"
            }
        except Exception as e:
            logger.error(f"SQL validation error: {str(e)}")
            return {
                "valid": False,
                "error": f"Security validation failed: {str(e)}"
            }
