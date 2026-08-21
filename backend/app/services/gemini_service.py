import json
import logging
import google.generativeai as genai
from app.core.config import settings
from app.services.schema_service import SchemaService

logger = logging.getLogger(__name__)

class GeminiService:
    _configured = False

    @classmethod
    def _ensure_configured(cls):
        if not cls._configured:
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY is not set in environment variables.")
            genai.configure(api_key=settings.GEMINI_API_KEY)
            cls._configured = True

    @classmethod
    def generate_sql(cls, question: str, history_context: list = None) -> dict:
        """
        Translates a natural language question into a structured JSON containing SQL,
        explanation, query type and recommended visualization.
        """
        cls._ensure_configured()
        
        # Get schema context
        schema_context = SchemaService.get_schema_context_prompt()
        
        # Build prompt
        system_prompt = """You are an expert MySQL SQL generation assistant.
Your job is to convert natural-language questions into valid MySQL SELECT queries.

Use ONLY the tables and columns provided in the schema.
Never invent tables or columns.
Never generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, RENAME, GRANT, or REVOKE statements.
Generate only one SQL SELECT statement.
Use correct MySQL syntax (e.g. using backticks for SQL keywords used as column names like `sql`, `status`, etc.).
Consider table relationships and foreign keys.
Use aggregation and JOINs where appropriate.
Use aliases for readability.

You MUST respond in JSON format with the following keys:
1. "sql": The generated SQL SELECT statement (string). Do not include markdown fences around the SQL.
2. "explanation": A simple explanation of what the query does, written for non-technical business users (string).
3. "query_type": Must be "SELECT" (string).
4. "visualization": A dictionary recommendation containing:
   - "type": Best chart type to display this data. Choose exactly one of: "bar", "line", "pie", "area", "table".
   - "x_axis": The name of the column that should be on the X-axis (e.g. 'month', 'category', 'product_name'). Use null if not applicable.
   - "y_axis": The name of the column that should be on the Y-axis (e.g. 'revenue', 'units_sold'). Use null if not applicable.

If the question cannot be answered using the available schema, return a JSON response with an "error" key explaining why.
"""
        
        prompt = f"{system_prompt}\n\n{schema_context}\n\n"
        
        if history_context:
            prompt += "CONVERSATION HISTORY:\n"
            for chat in history_context:
                role = "User" if chat["role"] == "user" else "AI"
                prompt += f"{role}: {chat['content']}\n"
            prompt += "\n"
            
        prompt += f"CURRENT USER QUESTION: {question}\n\nReturn JSON response:"

        # Call Gemini Model
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Use JSON output constraint
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        try:
            result = json.loads(response.text)
            return result
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to parse Gemini JSON response. Text was: {response.text}")
            raise ValueError(f"Gemini returned an invalid JSON response: {str(jde)}")

    @classmethod
    def correct_sql(cls, original_sql: str, error_message: str, question: str) -> dict:
        """
        Receives an SQL query that failed execution and the MySQL error message,
        returns corrected SQL query and explanations in JSON format.
        """
        cls._ensure_configured()
        schema_context = SchemaService.get_schema_context_prompt()
        
        prompt = f"""You are an expert MySQL SQL repair assistant.
The following SQL query was generated to answer the user's question, but it failed execution with a MySQL database error.

USER QUESTION: {question}
FAILED SQL: {original_sql}
MYSQL ERROR: {error_message}

{schema_context}

Please inspect the schema, analyze the error, and correct the SQL query.
Make sure the returned SQL is a valid MySQL SELECT statement, uses correct column/table references, and fixes the error.

You MUST respond in JSON format with the following keys:
1. "sql": The corrected SQL SELECT statement (string).
2. "explanation": A brief explanation of what was wrong and how you corrected it (string).
3. "query_type": Must be "SELECT".
4. "visualization": A dictionary recommendation containing "type" ("bar", "line", "pie", "area", "table"), "x_axis" and "y_axis".

Return JSON response:
"""
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        try:
            return json.loads(response.text)
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to parse Gemini SQL correction JSON: {response.text}")
            raise ValueError("Gemini returned invalid JSON for SQL correction.")

    @classmethod
    def explain_sql(cls, sql: str) -> str:
        """Generates a plain-English explanation for an SQL query."""
        cls._ensure_configured()
        
        prompt = f"""Explain this SQL query to a non-technical business user:
{sql}

Provide a clean, concise, 2-3 sentence explanation focusing on what business metric is being fetched and how it is grouped/sorted. Do not use complex technical jargon.
"""
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        return response.text.strip()

    @classmethod
    def optimize_sql(cls, sql: str) -> dict:
        """
        Analyzes an SQL query and returns optimization suggestions (e.g. missing indexes, better joins).
        """
        cls._ensure_configured()
        schema_context = SchemaService.get_schema_context_prompt()
        
        prompt = f"""You are a senior database administrator and performance tuning expert.
Analyze the following MySQL query for efficiency and potential optimizations:

QUERY:
{sql}

{schema_context}

Provide recommendations for:
1. Indexes that would speed up this query.
2. Joining logic improvements (if any).
3. General query structure adjustments.

Respond in JSON format with the following keys:
1. "suggestions": A list of strings containing specific, actionable optimization tips.
2. "estimated_complexity": One of "Low", "Medium", "High".
3. "potential_indexes": A list of SQL statements to create suggested indexes (e.g., "CREATE INDEX idx_name ON table(col)"). These are suggestions only.
"""
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        try:
            return json.loads(response.text)
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to parse optimization response: {response.text}")
            return {
                "suggestions": ["Failed to parse optimization suggestions."],
                "estimated_complexity": "Medium",
                "potential_indexes": []
            }
class GeminiServiceMock:
    """Mock service used when GEMINI_API_KEY is not set."""
    @classmethod
    def generate_sql(cls, question: str, history_context: list = None) -> dict:
        q_lower = question.lower()
        if "revenue" in q_lower or "sales" in q_lower:
            return {
                "sql": "SELECT SUM(final_amount) AS revenue FROM orders WHERE status = 'Delivered'",
                "explanation": "Calculates the total revenue from all delivered orders.",
                "query_type": "SELECT",
                "visualization": {"type": "table", "x_axis": None, "y_axis": "revenue"}
            }
        else:
            return {
                "sql": "SELECT name, price FROM products LIMIT 10",
                "explanation": "Returns the name and price of the first 10 products.",
                "query_type": "SELECT",
                "visualization": {"type": "bar", "x_axis": "name", "y_axis": "price"}
            }
    @classmethod
    def correct_sql(cls, original_sql: str, error_message: str, question: str) -> dict:
        return {
            "sql": "SELECT name, price FROM products LIMIT 5",
            "explanation": "Corrected query to fallback to top 5 products.",
            "query_type": "SELECT",
            "visualization": {"type": "table", "x_axis": "name", "y_axis": "price"}
        }
    @classmethod
    def explain_sql(cls, sql: str) -> str:
        return "This is a fallback mock explanation since no Gemini API Key is configured."
    @classmethod
    def optimize_sql(cls, sql: str) -> dict:
        return {
            "suggestions": ["No API key configured for deep analysis. Add index on filter columns."],
            "estimated_complexity": "Low",
            "potential_indexes": []
        }
