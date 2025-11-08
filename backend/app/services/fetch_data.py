# fetch_hotels.py
import httpx
from typing import Any, Dict, Union

async def fetch_hotels_all(city: str, api_key: str, api_host: str) -> Dict[str, Any]:
    base_url = "https://tripadvisor-scraper.p.rapidapi.com/hotels/list"
    headers = {"X-RapidAPI-Key": api_key, "X-RapidAPI-Host": api_host}

    page = 1
    all_by_id: Dict[Union[int, str], Dict[str, Any]] = {}

    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            print(f"Fetching page {page} for {city}...")
            params = {"query": city, "page": page}
            resp = await client.get(base_url, headers=headers, params=params)
            resp.raise_for_status()
            payload = resp.json()

            # Normalize payload
            if isinstance(payload, list):
                payload = {"results": payload}
            results = (
                payload.get("results") or
                payload.get("data", {}).get("results") or
                payload.get("items") or
                []
            )

            if not results:
                break  # No more data

            # === KEEP FULL HOTEL OBJECT ===
            for h in results:
                hotel_id = (
                    h.get("id") or
                    h.get("location_id") or
                    h.get("hotel_id") or
                    h.get("hotelId")
                )
                if hotel_id is None:
                    continue
                try:
                    hotel_id = int(hotel_id)
                except (ValueError, TypeError):
                    hotel_id = str(hotel_id)

                # Keep **entire** hotel dict
                all_by_id[hotel_id] = h

            # Pagination
            total_pages = payload.get("total_pages") or payload.get("pagination", {}).get("total_pages") or 1
            if page >= total_pages:
                break
            page += 1

    return {
        "city": city,
        "count": len(all_by_id),
        "by_id": all_by_id,  # ← full raw data
    }