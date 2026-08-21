from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database.connection import get_readonly_db
from app.core.dependencies import get_current_user
from app.database.models import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_readonly_db)
):
    try:
        # Total products count
        q_products = db.execute(text("SELECT COUNT(*) FROM products")).scalar() or 0
        
        # Total customers count (role = 'USER')
        q_customers = db.execute(text("SELECT COUNT(*) FROM users WHERE role = 'USER'")).scalar() or 0
        
        # Total orders count
        q_orders = db.execute(text("SELECT COUNT(*) FROM orders")).scalar() or 0
        
        # Total revenue (only delivered orders)
        q_revenue = db.execute(text("SELECT SUM(final_amount) FROM orders WHERE status = 'Delivered'")).scalar() or 0.0
        
        return {
            "total_products": int(q_products),
            "total_customers": int(q_customers),
            "total_orders": int(q_orders),
            "total_revenue": float(round(q_revenue, 2))
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard summary: {str(e)}"
        )

@router.get("/revenue")
def get_revenue_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_readonly_db)
):
    try:
        # Monthly revenue trends
        query = """
            SELECT 
                DATE_FORMAT(order_date, '%Y-%m') as month, 
                SUM(final_amount) as revenue,
                COUNT(id) as orders_count
            FROM orders 
            WHERE status = 'Delivered' 
            GROUP BY month 
            ORDER BY month ASC
        """
        results = db.execute(text(query)).all()
        
        trends = []
        for r in results:
            trends.append({
                "month": r.month,
                "revenue": float(round(r.revenue or 0.0, 2)),
                "orders_count": int(r.orders_count)
            })
            
        return trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch revenue trends: {str(e)}"
        )

@router.get("/top-products")
def get_top_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_readonly_db)
):
    try:
        # Top 5 products by revenue
        query = """
            SELECT 
                p.name as product_name, 
                SUM(oi.quantity) as units_sold, 
                SUM(oi.subtotal) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'Delivered'
            GROUP BY p.id, p.name
            ORDER BY revenue DESC
            LIMIT 5
        """
        results = db.execute(text(query)).all()
        
        products = []
        for r in results:
            products.append({
                "product_name": r.product_name,
                "units_sold": int(r.units_sold),
                "revenue": float(round(r.revenue or 0.0, 2))
            })
            
        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch top products: {str(e)}"
        )

@router.get("/category-sales")
def get_category_sales(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_readonly_db)
):
    try:
        # Sales breakdown by product category
        query = """
            SELECT 
                c.name as category, 
                SUM(oi.subtotal) as revenue, 
                COUNT(DISTINCT o.id) as orders_count
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'Delivered'
            GROUP BY c.id, c.name
            ORDER BY revenue DESC
        """
        results = db.execute(text(query)).all()
        
        breakdown = []
        for r in results:
            breakdown.append({
                "category": r.category,
                "revenue": float(round(r.revenue or 0.0, 2)),
                "orders_count": int(r.orders_count)
            })
            
        return breakdown
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch category sales: {str(e)}"
        )
