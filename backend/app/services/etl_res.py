# etl_restaurants.py
import psycopg2
from psycopg2.extras import Json, execute_values
import os

def parse_price_range(price_str):
    if not price_str:
        return None, None
    
    # Example formats:
    # "$"
    # "$$"
    # "$$ - $$$"
    if " - " in price_str:
        low, high = price_str.split(" - ")
        return len(low), len(high)
    else:
        # Single symbol -> same min and max
        return len(price_str), len(price_str)


def save_restaurants_to_db(data):
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    cur = conn.cursor()

    restaurants = []
    for rest_id, r in data["by_id"].items():
        price_str = r.get("price_range_usd")
        price_min, price_max = parse_price_range(price_str)

        restaurants.append((
            rest_id,
            data["city"],
            r.get("name"),
            r.get("rating"),
            r.get("reviews"),
            price_str,           # keep original string too if you want
            price_min,
            price_max,
            r.get("is_sponsored"),
            r.get("menu_link"),
            r.get("reservation_link"),
            r.get("link"),
            r.get("latitude"),
            r.get("longitude"),
            r.get("featured_image"),
            r.get("has_delivery"),
            r.get("is_premium"),
            Json(r.get("cuisines") or [])
        ))


    query = """
        INSERT INTO restaurants (
        id, city, name, rating, reviews, price_range,
        price_min, price_max,
        is_sponsored, menu_link, reservation_link,
        link, lat, lng, featured_image,
        has_delivery, is_premium, cuisines
        )
        VALUES %s
        ON CONFLICT (id) DO UPDATE SET
            city = EXCLUDED.city,
            name = EXCLUDED.name,
            rating = EXCLUDED.rating,
            reviews = EXCLUDED.reviews,
            price_range = EXCLUDED.price_range,
            price_min = EXCLUDED.price_min,
            price_max = EXCLUDED.price_max,
            is_sponsored = EXCLUDED.is_sponsored,
            menu_link = EXCLUDED.menu_link,
            reservation_link = EXCLUDED.reservation_link,
            link = EXCLUDED.link,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            featured_image = EXCLUDED.featured_image,
            has_delivery = EXCLUDED.has_delivery,
            is_premium = EXCLUDED.is_premium,
            cuisines = EXCLUDED.cuisines;
        """

    execute_values(cur, query, restaurants)
    conn.commit()
    cur.close()
    conn.close()

    print(f"Saved {len(restaurants)} restaurants for {data['city']}")

