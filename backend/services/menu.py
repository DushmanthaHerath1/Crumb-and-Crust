#stdlib
from datetime import datetime

#local
import models

#thirdparty
from sqlalchemy import Date, cast, func

def resolve_featured_id(products, db):
    """
    Decides which product_id should be featured.
    Priority:
    * any product with is_featured=True in database wins immediately
    * product with most quantity sold in paid orders TODAY
    * product with most quantity sold all-time (fallback)
    * first product in the list
    """
    manual = next((p for p in products if p.is_featured), None)
    if manual:
        return manual.id

    today = datetime.now().date()
    today_best = (
        db.query(
            models.OrderItem.product_id,
            func.sum(models.OrderItem.quantity).label("qty")
        ).join(models.Order).filter(
            models.Order.status == "paid",
            cast(models.Order.pickup_datetime, Date) == today,
        ).group_by(models.OrderItem.product_id).order_by(
            func.sum(models.OrderItem.quantity).desc()
        ).first()
    )
    if today_best:
        return today_best.product_id

    alltime_best = (
        db.query(
            models.OrderItem.product_id,
            func.sum(models.OrderItem.quantity).label("qty"),
        ).join(models.Order).filter(
            models.Order.status == "paid",
        ).group_by(
            models.OrderItem.product_id
        ).order_by(
            func.sum(models.OrderItem.quantity).desc()
        ).first()
    )
    if alltime_best:
        return alltime_best.product_id

    return products[0].id if products else None