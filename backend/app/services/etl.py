# etl.py
import psycopg2
from psycopg2.extras import execute_values, Json  # ← ADD Json
import os

def save_hotels_to_db(data):
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    cur = conn.cursor()

    hotels = []
    for hotel_id, h in data["by_id"].items():
        pr = h.get("price_range_usd") or {}
        price_min = pr.get("min")
        price_max = pr.get("max")
        price_avg = (price_min + price_max) / 2 if price_min and price_max else None

        hotels.append((
            hotel_id,
            data["city"],
            h.get("name"),
            h.get("rating"),
            h.get("address"),
            price_min,
            price_max,
            price_avg,
            h.get("link"),
            h.get("latitude"),
            h.get("longitude"),
            h.get("reviews"),
            h.get("phone"),
            Json(h.get("detailed_address")),      # ← Json()
            Json(h.get("ranking")),               # ← Json()
            h.get("featured_image"),
            Json(h.get("highlights") or []),      # ← Json()
            Json(h.get("providers") or []),       # ← Json()
        ))

    query = """
        INSERT INTO hotels (
            id, city, name, rating, address,
            price_min, price_max, price_avg,
            link, lat, lng,
            reviews, phone, detailed_address, ranking,
            featured_image, highlights, providers
        ) VALUES %s
        ON CONFLICT (id) DO UPDATE SET
            city = EXCLUDED.city,
            name = EXCLUDED.name,
            rating = EXCLUDED.rating,
            address = EXCLUDED.address,
            price_min = EXCLUDED.price_min,
            price_max = EXCLUDED.price_max,
            price_avg = EXCLUDED.price_avg,
            link = EXCLUDED.link,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            reviews = EXCLUDED.reviews,
            phone = EXCLUDED.phone,
            detailed_address = EXCLUDED.detailed_address,
            ranking = EXCLUDED.ranking,
            featured_image = EXCLUDED.featured_image,
            highlights = EXCLUDED.highlights,
            providers = EXCLUDED.providers;
    """

    execute_values(cur, query, hotels)
    conn.commit()
    cur.close()
    conn.close()
    print(f"Saved {len(hotels)} hotels for {data['city']}")