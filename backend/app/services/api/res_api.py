# api/restaurant_api.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db_cursor

router = APIRouter()

class RestaurantFilter(BaseModel):
    rating_min: float
    rating_max: float
    price_min: Optional[int] = None  # numeric ($ = 1, $$ = 2...)
    price_max: Optional[int] = None
    page: int = 1          # default page
    limit: int = 50 

@router.post("/restaurants/filter")
def filter_restaurants(filters: RestaurantFilter):

    sql = """
        SELECT
            id, name, rating, reviews, price_range, price_min, price_max, link,
            lat, lng, city, featured_image, is_sponsored, has_delivery,
            is_premium, cuisines, menu_link, reservation_link
        FROM restaurants
        WHERE rating >= %s AND rating <= %s
    """
    params = [filters.rating_min, filters.rating_max]

    if filters.price_min is not None:
        sql += " AND price_min >= %s"
        params.append(filters.price_min)

    if filters.price_max is not None:
        sql += " AND price_max <= %s"
        params.append(filters.price_max)

    sql += " ORDER BY rating DESC LIMIT %s OFFSET %s"
    offset = (filters.page - 1) * filters.limit
    params.extend([filters.limit, offset])

    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, params)
            rows = cursor.fetchall()

            columns = [
                "id", "name", "rating", "reviews", "price_range", "price_min", "price_max",
                "link", "lat", "lng", "city", "featured_image",
                "is_sponsored", "has_delivery", "is_premium",
                "cuisines", "menu_link", "reservation_link"
            ]

            restaurants = [dict(zip(columns, r)) for r in rows]

            return {
                "data": restaurants,
                "total": len(restaurants),
                "page": filters.page,
                "limit": filters.limit
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/restaurants")
def get_restaurants(
    min_price: int = Query(1),
    max_price: int = Query(4),
    min_rating: float = Query(0),
    max_rating: float = Query(5),
):
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT
                    id, name, rating, reviews, price_range,
                    price_min, price_max,
                    link, lat, lng, city, featured_image,
                    is_sponsored, has_delivery, is_premium,
                    cuisines, menu_link, reservation_link
                FROM restaurants
                WHERE price_min >= %s AND price_max <= %s
                  AND rating >= %s AND rating <= %s
            """, (min_price, max_price, min_rating, max_rating))

            rows = cursor.fetchall()
            columns = [
                "id", "name", "rating", "reviews", "price_range",
                "price_min", "price_max",
                "link", "lat", "lng", "city", "featured_image",
                "is_sponsored", "has_delivery", "is_premium",
                "cuisines", "menu_link", "reservation_link"
            ]

            restaurants = [dict(zip(columns, row)) for row in rows]

            # Add derived price_avg
            for r in restaurants:
                if r["price_min"] and r["price_max"]:
                    r["price_avg"] = (r["price_min"] + r["price_max"]) / 2
                else:
                    r["price_avg"] = None

            # Round ratings
            for r in restaurants:
                if r["rating"]:
                    r["rating"] = round(r["rating"], 1)

            return {"data": restaurants, "total": len(restaurants)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
