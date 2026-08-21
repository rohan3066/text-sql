import time
from typing import Dict, List, Any
from sqlalchemy import inspect
from app.database.connection import readonly_engine, admin_engine

class SchemaService:
    @staticmethod
    def get_connection_latency() -> float:
        """Returns MySQL connection latency in milliseconds."""
        start_time = time.time()
        # Run a simple query to test connection
        conn = readonly_engine.connect()
        try:
            conn.exec_driver_sql("SELECT 1")
            latency = (time.time() - start_time) * 1000
            return round(latency, 2)
        except Exception as e:
            raise e
        finally:
            conn.close()

    @staticmethod
    def get_table_names() -> List[str]:
        """Returns list of all tables in the database."""
        inspector = inspect(readonly_engine)
        return inspector.get_table_names()

    @staticmethod
    def get_table_schema(table_name: str) -> Dict[str, Any]:
        """Returns detailed columns, keys and foreign keys for a specific table."""
        inspector = inspect(readonly_engine)
        
        # Get columns details
        columns_raw = inspector.get_columns(table_name)
        columns = []
        for col in columns_raw:
            columns.append({
                "name": col["name"],
                "type": str(col["type"]),
                "nullable": col["nullable"],
                "default": str(col["default"]) if col.get("default") is not None else None
            })
            
        # Get primary keys
        pk_constraint = inspector.get_pk_constraint(table_name)
        primary_keys = pk_constraint.get("constrained_columns", [])
        
        # Get foreign keys
        foreign_keys_raw = inspector.get_foreign_keys(table_name)
        foreign_keys = []
        for fk in foreign_keys_raw:
            foreign_keys.append({
                "constrained_columns": fk["constrained_columns"],
                "referred_table": fk["referred_table"],
                "referred_columns": fk["referred_columns"]
            })
            
        # Get indexes
        indexes_raw = inspector.get_indexes(table_name)
        indexes = []
        for idx in indexes_raw:
            indexes.append({
                "name": idx["name"],
                "column_names": idx["column_names"],
                "unique": idx["unique"]
            })
            
        return {
            "table_name": table_name,
            "columns": columns,
            "primary_keys": primary_keys,
            "foreign_keys": foreign_keys,
            "indexes": indexes
        }

    @classmethod
    def get_full_schema(cls) -> Dict[str, Dict[str, Any]]:
        """Returns details for all tables in the database."""
        tables = cls.get_table_names()
        schema = {}
        for table in tables:
            schema[table] = cls.get_table_schema(table)
        return schema

    @classmethod
    def get_schema_context_prompt(cls) -> str:
        """Generates a text context of the schema for LLM input."""
        schema_dict = cls.get_full_schema()
        lines = []
        lines.append("DATABASE SCHEMA:")
        
        for table_name, details in schema_dict.items():
            lines.append(f"\nTABLE: {table_name}")
            
            # Write columns
            for col in details["columns"]:
                col_type = col["type"]
                col_name = col["name"]
                
                # Check key qualifiers
                pk_flag = " PRIMARY KEY" if col_name in details["primary_keys"] else ""
                
                fk_flag = ""
                for fk in details["foreign_keys"]:
                    if col_name in fk["constrained_columns"]:
                        ref_tab = fk["referred_table"]
                        ref_cols = ", ".join(fk["referred_columns"])
                        fk_flag = f" FOREIGN KEY -> {ref_tab}({ref_cols})"
                        break
                        
                null_flag = " NOT NULL" if not col["nullable"] else " NULL"
                lines.append(f"  {col_name} {col_type}{pk_flag}{fk_flag}{null_flag}")
                
        # Append business rules
        lines.append("\nBUSINESS RULES & SEMANTIC GUIDELINES:")
        lines.append("- When calculating revenue/sales, prefer delivered orders (orders.status = 'Delivered') unless user explicitly asks otherwise.")
        lines.append("- Total order revenue is typically calculated using order_items.subtotal or orders.final_amount.")
        lines.append("- For product sales, count total quantity: SUM(order_items.quantity).")
        lines.append("- For average product rating, use AVG(reviews.rating).")
        lines.append("- For inventory/stock calculation: inventory.quantity - inventory.reserved_quantity.")
        lines.append("- Orders status can be: 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'.")
        lines.append("- Payment methods can be: 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery', 'Wallet'.")
        lines.append("- Review ratings must be between 1 and 5.")
        
        return "\n".join(lines)
