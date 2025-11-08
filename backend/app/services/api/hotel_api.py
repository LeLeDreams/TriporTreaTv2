# api/hotel_api.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db_cursor
import os

router = APIRouter()

class HotelFilter(BaseModel):
    rating_min: float
    rating_max: float
    price_min: Optional[float] = None
    price_max: Optional[float] = None

@router.post("/hotels/filter")
def filter_hotels(filters: HotelFilter):
    sql = """
        SELECT 
            id, name, rating, address,
            price_min, price_max, price_avg,
            link, lat, lng, city,
            reviews, phone, detailed_address, ranking,
            featured_image, highlights, providers
        FROM hotels
        WHERE rating >= %s AND rating <= %s
    """
    params = [filters.rating_min, filters.rating_max]

    if filters.price_min is not None:
        sql += " AND price_avg >= %s"
        params.append(filters.price_min)
    if filters.price_max is not None:
        sql += " AND price_avg <= %s"
        params.append(filters.price_max)

    count_sql = "SELECT COUNT(*) FROM hotels WHERE " + sql.split("WHERE", 1)[1]
    sql += " ORDER BY rating DESC, price_avg ASC"

    try:
        with get_db_cursor() as cursor:
            cursor.execute(count_sql, params)
            total = cursor.fetchone()[0]

            cursor.execute(sql, params)
            rows = cursor.fetchall()

            columns = [
                "id", "name", "rating", "address",
                "price_min", "price_max", "price_avg",
                "link", "lat", "lng", "city",
                "reviews", "phone", "detailed_address", "ranking",
                "featured_image", "highlights", "providers"
            ]
            hotels = [dict(zip(columns, row)) for row in rows]

            # Round rating
            for h in hotels:
                h["rating"] = round(h["rating"], 1) if h["rating"] else None

            return {
                "data": hotels,
                "total": total
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/hotels")
def get_hotels(
    min_price: float = Query(0),
    max_price: float = Query(10000),
    min_rating: float = Query(0),
    max_rating: float = Query(5)
):
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id, name, rating, address,
                    price_min, price_max, price_avg,
                    link, lat, lng, city,
                    reviews, phone, detailed_address, ranking,
                    featured_image, highlights, providers
                FROM hotels
                WHERE price_avg >= %s AND price_avg <= %s
                  AND rating >= %s AND rating <= %s
            """, (min_price, max_price, min_rating, max_rating))

            rows = cursor.fetchall()
            columns = [
                "id", "name", "rating", "address",
                "price_min", "price_max", "price_avg",
                "link", "lat", "lng", "city",
                "reviews", "phone", "detailed_address", "ranking",
                "featured_image", "high047lights", "providers"
            ]
            hotels = [dict(zip(columns, row)) for row in rows]

            for h in hotels:
                h["rating"] = round(h["rating"], 1) if h["rating"] else None

            return {"data": hotels, "total": len(hotels)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))