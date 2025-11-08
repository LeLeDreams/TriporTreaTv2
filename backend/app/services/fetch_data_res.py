import httpx
from typing import Any, Dict, Union

async def fetch_res_all(city: str, api_key: str, api_host: str) -> Dict[str, Any]:
    base_url = "https://tripadvisor-scraper.p.rapidapi.com/restaurants/list"
    headers = {"X-RapidAPI-Key": api_key, "X-RapidAPI-Host": api_host}

    page = 1
    max_pages = 50  # ✅ limit to first 50 pages
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
                payload.get("results")
                or payload.get("data", {}).get("results")
                or payload.get("items")
                or []
            )

            if not results:
                break

            for r in results:
                res_id = r.get("id") or r.get("location_id")
                if res_id is None:
                    continue
                try:
                    res_id = int(res_id)
                except (ValueError, TypeError):
                    res_id = str(res_id)

                all_by_id[res_id] = r

            total_pages = (
                payload.get("total_pages")
                or payload.get("pagination", {}).get("total_pages")
                or 1
            )

            # ✅ STOP AT 50 PAGES
            if page >= total_pages or page >= max_pages:
                break

            page += 1

    return {
        "city": city,
        "count": len(all_by_id),
        "by_id": all_by_id,
    }
