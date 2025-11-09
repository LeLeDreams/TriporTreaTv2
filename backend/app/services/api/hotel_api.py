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

class ClickLog(BaseModel):
    session_id: str
    hotel_id: int

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
                "featured_image", "highlights", "providers"
            ]
            hotels = [dict(zip(columns, row)) for row in rows]

            for h in hotels:
                h["rating"] = round(h["rating"], 1) if h["rating"] else None

            return {"data": hotels, "total": len(hotels)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/clicks")
def log_click(click: ClickLog):
    """Log user click on hotel link"""
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                "INSERT INTO user_clicks (session_id, hotel_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (click.session_id, click.hotel_id)
            )
        return {"status": "logged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommend")
def get_recommendations(session_id: str, city: str = "New York", limit: int = 5):
    import json
    print(f"\n=== RECOMMEND DEBUG ===")
    print(f"Session: {session_id} | City: {city}")

    try:
        with get_db_cursor() as cursor:
            # 1. Get ALL clicked hotels (not just 3)
            cursor.execute("""
                SELECT DISTINCT h.highlights, h.id, h.name
                FROM user_clicks uc
                JOIN hotels h ON uc.hotel_id = h.id
                WHERE uc.session_id = %s
            """, (session_id,))
            clicked_rows = cursor.fetchall()
            print(f"Clicked hotels: {len(clicked_rows)}")

            if not clicked_rows:
                return {"recommendations": []}

            clicked_highlights = set()
            clicked_ids = set()
            for row in clicked_rows:
                raw = row[0] or []
                if isinstance(raw, str):
                    try: highlights = set(json.loads(raw))
                    except: highlights = set()
                else:
                    highlights = set(raw)
                clicked_highlights.update(highlights)
                clicked_ids.add(row[1])

            print(f"Unique highlights: {clicked_highlights}")
            print(f"Clicked hotel IDs: {clicked_ids}")

            if not clicked_highlights:
                return {"recommendations": []}

            # 2. Get MORE candidates (remove LIMIT 50)
            cursor.execute("""
                SELECT id, name, rating, price_avg, link, featured_image, highlights
                FROM hotels
                WHERE city = %s AND highlights IS NOT NULL
                ORDER BY rating DESC
                -- LIMIT 200  -- optional: increase if needed
            """, (city,))
            all_rows = cursor.fetchall()
            print(f"Candidate hotels: {len(all_rows)}")

            recs = []
            for row in all_rows:
                h_id, name, rating, price_avg, link, image, raw = row
                if h_id in clicked_ids:
                    continue  # ← NOW we exclude clicked (optional)

                rating = float(rating) if rating is not None else 0.0
                price_avg = float(price_avg) if price_avg is not None else 0

                raw = raw or []
                if isinstance(raw, str):
                    try: h_highlights = set(json.loads(raw))
                    except: h_highlights = set()
                else:
                    h_highlights = set(raw)

                inter = len(clicked_highlights & h_highlights)
                if inter == 0:
                    continue

                union = len(clicked_highlights | h_highlights)
                score = inter / union
                rating_boost = max(0, (rating - 4.0) * 0.1)
                final = score + rating_boost

                recs.append({
                    "id": h_id,
                    "name": name,
                    "rating": round(rating, 1),
                    "price_avg": int(price_avg),
                    "link": link,
                    "featured_image": image,
                    "similarity_score": round(final, 2),
                    "matched_highlights": list(clicked_highlights & h_highlights)
                })

            recs.sort(key=lambda x: x["similarity_score"], reverse=True)
            print(f"Final recommendations: {len(recs[:limit])}")
            return {"recommendations": recs[:limit]}

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))